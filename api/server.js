import express from "express";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import cors from "cors";
import path from "path";
import { createServer } from "http";
import Groq from 'groq-sdk';
import Recipe from "./models/Recipe.js";
import User from "./models/User.js";
import { protectRoute } from "./middleware/protectRoute.js";
// import { Toolhouse } from '@toolhouseai/sdk';
import compression from 'compression';
import helmet from 'helmet';
import statusMonitor from 'express-status-monitor';
import rateLimit from 'express-rate-limit';

// routes
import authRoutes from "./routes/authRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import matchRoutes from "./routes/matchRoutes.js";
import messageRoutes from "./routes/messageRoutes.js";

import { connectDB } from "./config/db.js";
import { initializeSocket } from "./socket/socket.server.js";

dotenv.config();

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });
const app = express();
const httpServer = createServer(app);
const PORT = process.env.PORT || 4999;

const __dirname = path.resolve();

initializeSocket(httpServer);

app.use(compression());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ limit: '50mb', extended: true }));
app.use(cookieParser());
app.use(
	cors({
		origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
		credentials: true,
		methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
		allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
	})
);

app.use(helmet({
	contentSecurityPolicy: {
		directives: {
			defaultSrc: ["'self'"],
			connectSrc: ["'self'", "wss:", "ws:", "https:"],
			imgSrc: ["'self'", "data:", "https:", "blob:"],
			scriptSrc: ["'self'", "'unsafe-inline'"],
			styleSrc: ["'self'", "'unsafe-inline'"],
		}
	},
	crossOriginEmbedderPolicy: false,
	crossOriginResourcePolicy: false
}));
app.use(statusMonitor());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/matches", matchRoutes);
app.use("/api/messages", messageRoutes);

const limiter = rateLimit({
	windowMs: 15 * 60 * 1000, // 15 minutes
	max: 100 // limit each IP to 100 requests per windowMs
});

app.use('/api/', limiter);

// Add favorites endpoints
app.post('/api/users/favorites', protectRoute, async (req, res) => {
	try {
		const { id, title, cuisine, description } = req.body;
		const userId = req.user.id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		// Check if recipe already exists in favorites
		const existingFavorite = user.favorites.find(fav => fav.recipeId === id);
		if (existingFavorite) {
			return res.status(400).json({ error: "Recipe already in favorites" });
		}

		const updatedUser = await User.update(userId, {
			favorites: [...user.favorites, {
				recipeId: id,
				title,
				cuisine,
				description
			}]
		});

		res.status(200).json(updatedUser.favorites);
	} catch (error) {
		console.error("Error adding favorite:", error);
		res.status(500).json({ error: "Error adding favorite" });
	}
});

app.delete('/api/users/favorites/:id', protectRoute, async (req, res) => {
	try {
		const { id } = req.params;
		const userId = req.user.id;

		const user = await User.findById(userId);
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		const updatedUser = await User.update(userId, {
			favorites: user.favorites.filter(fav => fav.recipeId !== id)
		});

		res.status(200).json(updatedUser.favorites);
	} catch (error) {
		console.error("Error removing favorite:", error);
		res.status(500).json({ error: "Error removing favorite" });
	}
});

app.get('/api/users/favorites', protectRoute, async (req, res) => {
	try {
		const userId = req.user.id;
		const user = await User.findById(userId);
		
		if (!user) {
			return res.status(404).json({ error: "User not found" });
		}

		res.status(200).json(user.favorites);
	} catch (error) {
		console.error("Error fetching favorites:", error);
		res.status(500).json({ error: "Error fetching favorites" });
	}
});

app.post('/api/groq/recipes', async (req, res) => {
	try {
		const { currentUser, selectedUser } = req.body;
		
		const currentUserId = currentUser.id;
		const selectedUserId = selectedUser.id;

		console.log('currentUser ID', currentUserId);
		console.log('selectedUser ID', selectedUserId);

		// Check for existing recipes first
		const existingRecipe = await Recipe.findByUsers([currentUserId, selectedUserId]);

		if (existingRecipe) {
			return res.json({ 
				success: true,
				markdown: existingRecipe.markdown,
				recipes: existingRecipe.recipes
			});
		}

		const combinedIngredients = [
			...(currentUser.ingredientsList || []),
			...(selectedUser.ingredientsList || [])
		].map(i => `${i.ingredient} (${i.quantity})`);

		const combinedCuisines = [...new Set([
			...(currentUser.preferences?.cuisines || []),
			...(selectedUser.preferences?.cuisines || [])
		])];

		const combinedDietaryRestrictions = {
			vegetarian: currentUser.dietaryRestrictions?.vegetarian || selectedUser.dietaryRestrictions?.vegetarian,
			vegan: currentUser.dietaryRestrictions?.vegan || selectedUser.dietaryRestrictions?.vegan,
			kosher: currentUser.dietaryRestrictions?.kosher || selectedUser.dietaryRestrictions?.kosher,
			glutenFree: currentUser.dietaryRestrictions?.glutenFree || selectedUser.dietaryRestrictions?.glutenFree,
			dairyFree: currentUser.dietaryRestrictions?.dairyFree || selectedUser.dietaryRestrictions?.dairyFree,
			allergies: [...new Set([
				...(currentUser.dietaryRestrictions?.allergies || []),
				...(selectedUser.dietaryRestrictions?.allergies || [])
			])]
		};

		// Convert dietary restrictions object to array of active restrictions
		const restrictionsArray = [
			...Object.entries(combinedDietaryRestrictions)
				.filter(([key, value]) => value && key !== 'allergies')
				.map(([key]) => key),
			...combinedDietaryRestrictions.allergies
		];

		const recipePrompt = `Generate 3 recipes that:
1. Use these ingredients: ${combinedIngredients.join(', ')}
2. Match these cuisine preferences: ${combinedCuisines.join(', ')}
3. Follow these dietary restrictions: ${restrictionsArray.join(', ')}

Format each recipe exactly like this:

## [Recipe Name]
### [Cuisine Type]

[2-3 sentence description of the dish explaining what makes it special and how it uses the available ingredients and bold the ingredients used]

---`;

		const completion = await groq.chat.completions.create({
			messages: [{ role: 'user', content: recipePrompt }],
			model: 'llama-3.3-70b-versatile',
			temperature: 0.7,
			max_tokens: 1000,
		});

		const markdownRecipes = completion.choices[0].message.content;

		// Add this new prompt to structure the data
		const structuringPrompt = `Convert these markdown recipes into a JSON array where each recipe has:
- title: The recipe name without brackets
- cuisine: The cuisine type without brackets
- description: The description paragraph

Input markdown:
${markdownRecipes}

Return ONLY a raw JSON array with no markdown formatting, no backticks, and no 'json' prefix. The response should start with '[' and end with ']'.`;

		const completion2 = await groq.chat.completions.create({
			messages: [{ role: 'user', content: structuringPrompt }],
			model: 'llama-3.3-70b-versatile',
			temperature: 0.1,
			max_tokens: 1000,
		});

		const structuredRecipes = JSON.parse(completion2.choices[0].message.content);

		// Save the recipe to the database
		const newRecipe = await Recipe.create({
			users: [currentUserId, selectedUserId],
			markdown: markdownRecipes,
			recipes: structuredRecipes
		});

		res.json({ 
			success: true,
			markdown: newRecipe.markdown,
			recipes: newRecipe.recipes
		});
	} catch (error) {
		console.error('Error generating recipes:', error);
		res.status(500).json({ error: 'Error generating recipes' });
	}
});




app.use((err, req, res, next) => {
	console.error(err.stack);
	res.status(500).json({
		success: false,
		message: process.env.NODE_ENV === 'production' 
			? 'Internal server error' 
			: err.message
	});
});

if (process.env.NODE_ENV === "production") {
	app.use(express.static(path.join(__dirname, "/client/dist")));

	app.get("*", (req, res) => {
		res.sendFile(path.resolve(__dirname, "client", "dist", "index.html"));
	});
}

connectDB().then(() => {
	httpServer.listen(PORT, () => {
		console.log(`Server running on port ${PORT}`);
	});
});

// Add this to your server.js
