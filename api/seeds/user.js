import bcrypt from "bcryptjs";
import prisma from "../config/db.js";
import dotenv from "dotenv";

dotenv.config();

const cuisineTypes = ["American", "Chinese", "Indian", "Italian", "Mexican", "Korean", "Japanese", "Persian", "Jamaican"];

const names = [
	"Nathan", 
	"Chris",
	"Alex", "Jordan", "Sam", "Taylor", "Morgan",
	"Jamie", "Casey", "Riley", "Avery"
];

const shuffleArray = (array) => {
	return array.sort(() => 0.5 - Math.random());
};

const generateRandomUser = (index) => {
	const name = names[index];
	
	// Special case for Nathan
	if (name === "Nathan") {
		return {
			name: "Nathan",
			email: "nathan1@example.com",
			password: bcrypt.hashSync("password123", 10),
			image: `/avatars/${index + 1}.jpg`,
			preferences: {
				create: {
					cuisines: ["American", "Chinese"],
				},
			},
			dietaryRestrictions: {
				create: {
					vegetarian: false,
					vegan: false,
					kosher: false,
					glutenFree: false,
					dairyFree: false,
					allergies: ["peanuts"],
				},
			},
			availableAppliances: {
				create: {
					airFryer: true,
					microwave: true,
					oven: true,
					stoveTop: true,
					sousVide: false,
					deepFryer: false,
					blender: true,
					instantPot: true,
				},
			},
			ingredientsList: {
				create: [
					{ ingredient: "Cabbage", quantity: "500g" },
					{ ingredient: "Pepper", quantity: "200g" },
					{ ingredient: "Olive Oil", quantity: "0.25L" },
				],
			},
			dietaryGoals: {
				create: {
					protein: 40,
					carbs: 30,
					fats: 30,
				},
			},
			location: "Houston, TX",
		};
	}

	// Special case for Chris
	if (name === "Chris") {
		return {
			name: "Chris",
			email: "chris1@example.com",
			password: bcrypt.hashSync("password123", 10),
			image: `/avatars/${index + 1}.jpg`,
			preferences: {
				create: {
					cuisines: ["American", "Chinese"],
				},
			},
			dietaryRestrictions: {
				create: {
					vegetarian: false,
					vegan: false,
					kosher: false,
					glutenFree: false,
					dairyFree: false,
					allergies: ["peanuts"],
				},
			},
			availableAppliances: {
				create: {
					airFryer: true,
					microwave: true,
					oven: true,
					stoveTop: true,
					sousVide: false,
					deepFryer: false,
					blender: true,
					instantPot: true,
				},
			},
			ingredientsList: {
				create: [
					{ ingredient: "Chicken Breast", quantity: "300g" },
					{ ingredient: "Quinoa", quantity: "200g" },
					{ ingredient: "Sweet Potato", quantity: "300g" }
				],
			},
			dietaryGoals: {
				create: {
					protein: 40,
					carbs: 30,
					fats: 30,
				},
			},
			location: "Houston, TX",
		};
	}

	// Original random user generation for other users
	const age = Math.floor(Math.random() * (45 - 21 + 1) + 21);
	return {
		name,
		email: `${name.toLowerCase()}${age}@example.com`,
		password: bcrypt.hashSync("password123", 10),
		image: `/avatars/${index + 1}.jpg`,
		preferences: {
			create: {
				cuisines: shuffleArray(cuisineTypes).slice(0, Math.floor(Math.random() * 4) + 2),
			},
		},
		dietaryRestrictions: {
			create: {
				vegetarian: Math.random() < 0.2,
				vegan: Math.random() < 0.1,
				kosher: Math.random() < 0.1,
				glutenFree: Math.random() < 0.15,
				dairyFree: Math.random() < 0.15,
				allergies: Math.random() < 0.2 ? ["peanuts", "shellfish"] : [],
			},
		},
		availableAppliances: {
			create: {
				airFryer: Math.random() < 0.7,
				microwave: Math.random() < 0.9,
				oven: Math.random() < 0.95,
				stoveTop: Math.random() < 0.95,
				sousVide: Math.random() < 0.2,
				deepFryer: Math.random() < 0.3,
				blender: Math.random() < 0.8,
				instantPot: Math.random() < 0.6,
			},
		},
		ingredientsList: {
			create: [
				{ ingredient: "Salt", quantity: "500g" },
				{ ingredient: "Pepper", quantity: "200g" },
				{ ingredient: "Olive Oil", quantity: "1L" },
			],
		},
		dietaryGoals: {
			create: {
				protein: Math.floor(Math.random() * (200 - 120 + 1) + 120),
				carbs: Math.floor(Math.random() * (300 - 200 + 1) + 200),
				fats: Math.floor(Math.random() * (80 - 40 + 1) + 40),
			},
		},
		location: ["New York, NY", "Los Angeles, CA", "Chicago, IL", "Houston, TX", "Dallas, TX"][Math.floor(Math.random() * 5)],
	};
};

const seedUsers = async () => {
	try {
		// Delete all existing data
		await prisma.user.deleteMany({});

		// Create new users
		const users = Array.from({ length: 10 }, (_, i) => generateRandomUser(i));
		
		for (const user of users) {
			await prisma.user.create({
				data: user,
			});
		}

		console.log("Database seeded successfully with 10 users");
	} catch (error) {
		console.error("Error seeding database:", error);
	} finally {
		await prisma.$disconnect();
	}
};

seedUsers();
