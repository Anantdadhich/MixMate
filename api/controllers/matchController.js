import User from "../models/User.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import axios from "axios";
import prisma from "../config/db.js";

export const swipeRight = async (req, res) => {
	try {
		const { likedUserId } = req.params;
		const currentUser = await User.findById(req.user.id);
		const likedUser = await User.findById(likedUserId);

		if (!likedUser) {
			return res.status(404).json({
				success: false,
				message: "User not found",
			});
		}

		// Check if already liked
		const existingLike = await prisma.userLike.findFirst({
			where: {
				userId: currentUser.id,
				likedUserId: likedUserId
			}
		});

		if (!existingLike) {
			// Create the like
			await prisma.userLike.create({
				data: {
					userId: currentUser.id,
					likedUserId: likedUserId
				}
			});

			// Check if it's a match
			const existingMatch = await prisma.userLike.findFirst({
				where: {
					userId: likedUserId,
					likedUserId: currentUser.id
				}
			});

			if (existingMatch) {
				// Create match for both users
				await prisma.userMatch.createMany({
					data: [
						{ userId: currentUser.id, matchedUserId: likedUserId },
						{ userId: likedUserId, matchedUserId: currentUser.id }
					]
				});

				// send notification in real-time with socket.io
				const connectedUsers = getConnectedUsers();
				const io = getIO();

				const likedUserSocketId = connectedUsers.get(likedUserId);
				if (likedUserSocketId) {
					io.to(likedUserSocketId).emit("newMatch", {
						id: currentUser.id,
						name: currentUser.name,
						image: currentUser.image,
					});
				}

				const currentSocketId = connectedUsers.get(currentUser.id);
				if (currentSocketId) {
					io.to(currentSocketId).emit("newMatch", {
						id: likedUser.id,
						name: likedUser.name,
						image: likedUser.image,
					});
				}
			}
		}

		res.status(200).json({
			success: true,
			user: currentUser,
		});
	} catch (error) {
		console.error("Error in swipeRight: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

export const swipeLeft = async (req, res) => {
	try {
		const { dislikedUserId } = req.params;
		const currentUser = await User.findById(req.user.id);

		// Check if already disliked
		const existingDislike = await prisma.userDislike.findFirst({
			where: {
				userId: currentUser.id,
				dislikedUserId: dislikedUserId
			}
		});

		if (!existingDislike) {
			await prisma.userDislike.create({
				data: {
					userId: currentUser.id,
					dislikedUserId: dislikedUserId
				}
			});
		}

		res.status(200).json({
			success: true,
			user: currentUser,
		});
	} catch (error) {
		console.error("Error in swipeLeft: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

export const getMatches = async (req, res) => {
	try {
		const user = await User.findById(req.user.id);
		
		const matches = await prisma.userMatch.findMany({
			where: {
				userId: user.id
			},
			include: {
				matchedUser: {
					select: {
						id: true,
						name: true,
						image: true
					}
				}
			}
		});

		res.status(200).json({
			success: true,
			matches: matches.map(match => match.matchedUser),
		});
	} catch (error) {
		console.error("Error in getMatches: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

export const getUserProfiles = async (req, res) => {
	try {
		const currentUser = await User.findById(req.user.id);

		// Get all users in the same location, excluding current user, likes, dislikes, and matches
		const users = await prisma.user.findMany({
			where: {
				AND: [
					{ id: { not: currentUser.id } },
					{ NOT: {
						likes: { some: { userId: currentUser.id } }
					}},
					{ NOT: {
						dislikes: { some: { userId: currentUser.id } }
					}},
					{ NOT: {
						matches: { some: { userId: currentUser.id } }
					}}
				]
			},
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
				ingredientsList: true
			}
		});

		// Calculate compatibility scores
		const usersWithScores = await Promise.all(
			users.map(async (user) => {
				const score = await calculateCompatibilityScore(currentUser, user);
				return {
					...user,
					compatibilityScore: score,
				};
			})
		);

		// Sort by compatibility score
		usersWithScores.sort((a, b) => b.compatibilityScore - a.compatibilityScore);

		res.status(200).json({
			success: true,
			users: usersWithScores,
		});
	} catch (error) {
		console.error("Error in getUserProfiles: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

// Helper function to calculate compatibility score
async function calculateCompatibilityScore(currentUser, otherUser) {
	console.log('\n========== CALCULATING COMPATIBILITY SCORE ==========');
	console.log(`Comparing ${currentUser.name} with ${otherUser.name}\n`);
	
	let totalScore = 0;
	
	// 1. Ingredients Compatibility (40 points max)
	console.log('--- Starting Ingredients Compatibility Check ---');
	const ingredientsResult = await calculateIngredientsCompatibility(currentUser, otherUser);
	console.log(`Ingredients Score: ${ingredientsResult.score.toFixed(2)} * 40 = ${(ingredientsResult.score * 40).toFixed(2)} points\n`);
	totalScore += ingredientsResult.score * 40;

	// 2. Dietary Restrictions Compatibility (30 points max)
	console.log('--- Starting Dietary Restrictions Compatibility Check ---');
	const dietaryRestrictionsScore = calculateDietaryRestrictionsCompatibility(currentUser, otherUser);
	console.log(`Dietary Restrictions Score: ${dietaryRestrictionsScore.toFixed(2)} * 30 = ${(dietaryRestrictionsScore * 30).toFixed(2)} points\n`);
	totalScore += dietaryRestrictionsScore * 30;

	// 3. Cuisines Compatibility (30 points max)
	console.log('--- Starting Cuisines Compatibility Check ---');
	const cuisinesScore = calculateCuisinesCompatibility(currentUser, otherUser);
	console.log(`Cuisines Score: ${cuisinesScore.toFixed(2)} * 30 = ${(cuisinesScore * 30).toFixed(2)} points\n`);
	totalScore += cuisinesScore * 30;

	console.log(`FINAL TOTAL SCORE: ${Math.round(totalScore)}/100`);
	console.log('================================================\n');

	return {
		score: Math.round(totalScore),
		goalCompletion: ingredientsResult.goalCompletion
	};
}

async function calculateIngredientsCompatibility(currentUser, otherUser) {
	try {
		const combinedIngredients = [
			...currentUser.ingredientsList.map(i => `${i.quantity} ${i.ingredient}`),
			...otherUser.ingredientsList.map(i => `${i.quantity} ${i.ingredient}`)
		].join(', ');

		const response = await axios.get('https://api.calorieninjas.com/v1/nutrition', {
			params: { query: combinedIngredients },
			headers: {
				'X-Api-Key': process.env.CALORIE_NINJA_API_KEY
			}
		});

		if (!response.data.items?.length) return { score: 0, goalCompletion: { protein: 0, carbs: 0, fats: 0 } };

		// Calculate total macronutrients
		const totalNutrients = response.data.items.reduce((acc, item) => ({
			protein: acc.protein + (item.protein_g || 0),
			carbs: acc.carbs + (item.carbohydrates_total_g || 0),
			fats: acc.fats + (item.fat_total_g || 0)
		}), { protein: 0, carbs: 0, fats: 0 });

		// Compare with dietary goals
		const dietaryGoals = currentUser.dietaryGoals;
	
		// Calculate how close we are to meeting each goal (as percentages)
		const goalCompletion = {
			protein: dietaryGoals.protein === 0 ? 100 : Math.min((totalNutrients.protein / dietaryGoals.protein) * 100, 100),
			carbs: dietaryGoals.carbs === 0 ? 100 : Math.min((totalNutrients.carbs / dietaryGoals.carbs) * 100, 100),
			fats: dietaryGoals.fats === 0 ? 100 : Math.min((totalNutrients.fats / dietaryGoals.fats) * 100, 100)
		};

		// Calculate average completion ratio (as decimal for the score)
		const avgCompletion = (goalCompletion.protein + goalCompletion.carbs + goalCompletion.fats) / 300;

		console.log({
			totalNutrients,
			dietaryGoals,
			goalCompletion,
			score: avgCompletion
		});

		return {
			score: avgCompletion,
			goalCompletion: {
				protein: Math.round(goalCompletion.protein),
				carbs: Math.round(goalCompletion.carbs),
				fats: Math.round(goalCompletion.fats)
			}
		};
		
	} catch (error) {
		console.error('Error calculating ingredients compatibility:', error);
		return { score: 0, goalCompletion: { protein: 0, carbs: 0, fats: 0 } };
	}
}

// Function to calculate dietary restrictions compatibility
function calculateDietaryRestrictionsCompatibility(currentUser, otherUser) {
	try {
		console.log('\nChecking dietary restrictions compatibility...');
		let score = 1.0;
		
		console.log(`\n${currentUser.name}'s restrictions:`, currentUser.dietaryRestrictions);
		console.log(`${otherUser.name}'s restrictions:`, otherUser.dietaryRestrictions);

		const restrictions = ['vegetarian', 'vegan', 'kosher', 'glutenFree', 'dairyFree'];
		
		for (const restriction of restrictions) {
			if (currentUser.dietaryRestrictions[restriction] && !otherUser.dietaryRestrictions[restriction]) {
				console.log(`\nMismatch found for ${restriction} (-0.3)`);
				score -= 0.3;
			}
		}

		const currentUserAllergies = new Set(currentUser.dietaryRestrictions.allergies || []);
		const otherUserAllergies = new Set(otherUser.dietaryRestrictions.allergies || []);
		
		console.log('\nChecking allergies compatibility...');
		console.log(`${currentUser.name}'s allergies:`, [...currentUserAllergies]);
		console.log(`${otherUser.name}'s allergies:`, [...otherUserAllergies]);

		const conflictingAllergies = [...currentUserAllergies].filter(allergy =>
			otherUser.ingredientsList.some(item => item.ingredient === allergy)
		);

		if (conflictingAllergies.length > 0) {
			console.log(`Found ${conflictingAllergies.length} conflicting allergies (-0.5)`);
			score -= 0.5;
		}

		console.log(`Final dietary compatibility score: ${Math.max(0, score).toFixed(2)}`);
		return Math.max(0, score);
	} catch (error) {
		console.error('Error calculating dietary restrictions compatibility:', error);
		return 0;
	}
}

// Function to calculate cuisine compatibility
function calculateCuisinesCompatibility(currentUser, otherUser) {
	try {
		console.log('\nCalculating cuisines compatibility...');
		const currentUserCuisines = new Set(currentUser.preferences.cuisines || []);
		const otherUserCuisines = new Set(otherUser.preferences.cuisines || []);

		console.log(`${currentUser.name}'s cuisines:`, [...currentUserCuisines]);
		console.log(`${otherUser.name}'s cuisines:`, [...otherUserCuisines]);

		if (currentUserCuisines.size === 0 || otherUserCuisines.size === 0) {
			console.log('One or both users have no cuisine preferences');
			return 0;
		}

		const sharedCuisines = [...currentUserCuisines].filter(cuisine =>
			otherUserCuisines.has(cuisine)
		);

		console.log('Shared cuisines:', sharedCuisines);

		const score = sharedCuisines.length / 
			Math.min(currentUserCuisines.size, otherUserCuisines.size);

		console.log(`Final cuisine compatibility score: ${Math.min(1, score).toFixed(2)}`);
		return Math.min(1, score);
	} catch (error) {
		console.error('Error calculating cuisines compatibility:', error);
		return 0;
	}
}
