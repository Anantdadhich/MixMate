import User from "../models/User.js";
import jwt from "jsonwebtoken";

const signToken = (id) => {
	// jwt token
	return jwt.sign({ id }, process.env.JWT_SECRET, {
		expiresIn: "7d",
	});
};

export const signup = async (req, res) => {
	const { 
		name, 
		email, 
		password, 
		image, 
		preferences, 
		dietaryRestrictions, 
		availableAppliances, 
		ingredientsList,
		dietaryGoals,
		location  
	} = req.body;

	try {
		console.log('Signup attempt with data:', { name, email, image, location });

		if (!name || !email || !password) {
			return res.status(400).json({
				success: false,
				message: "Name, email, and password are required",
			});
		}

		if (password.length < 6) {
			return res.status(400).json({
				success: false,
				message: "Password must be at least 6 characters",
			});
		}

		// Check if user already exists
		const existingUser = await User.findByEmail(email);
		if (existingUser) {
			return res.status(400).json({
				success: false,
				message: "User with this email already exists",
			});
		}

		const newUser = await User.create({
			name,
			email,
			password,
			image: image || "",
			location: location || "", 
			preferences: {
				cuisines: preferences?.cuisines || []
			},
			dietaryRestrictions: dietaryRestrictions || {
				vegetarian: false,
				vegan: false,
				kosher: false,
				glutenFree: false,
				dairyFree: false,
				allergies: []
			},
			availableAppliances: availableAppliances || {},
			ingredientsList: ingredientsList || [],
			dietaryGoals: dietaryGoals || {}
		});

		const token = signToken(newUser.id);

		res.status(201).json({
			success: true,
			token,
			user: {
				id: newUser.id,
				name: newUser.name,
				email: newUser.email,
				image: newUser.image,
				location: newUser.location
			}
		});
	} catch (error) {
		console.error('Signup error:', error);
		res.status(500).json({
			success: false,
			message: "Error creating user",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

export const login = async (req, res) => {
	const { email, password } = req.body;
	try {
		if (!email || !password) {
			return res.status(400).json({
				success: false,
				message: "All fields are required",
			});
		}

		const user = await User.findByEmail(email);

		if (!user || !(await User.matchPassword(password, user.password))) {
			return res.status(401).json({
				success: false,
				message: "Invalid email or password",
			});
		}

		const token = signToken(user.id);

		res.cookie("jwt", token, {
			maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days in milliseconds
			httpOnly: true, // prevents XSS attacks
			sameSite: "strict", // prevents CSRF attacks
			secure: process.env.NODE_ENV === "production",
		});

		res.status(200).json({
			success: true,
			token,
			user: {
				id: user.id,
				name: user.name,
				email: user.email,
				image: user.image,
				location: user.location
			}
		});
	} catch (error) {
		console.error("Error in login controller:", error);
		res.status(500).json({ 
			success: false, 
			message: "Server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

export const logout = async (req, res) => {
	res.clearCookie("jwt");
	res.status(200).json({ success: true, message: "Logged out successfully" });
};
