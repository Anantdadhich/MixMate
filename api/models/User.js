import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

class User {
	static async create(data) {
		const hashedPassword = await bcrypt.hash(data.password, 10);
		return prisma.user.create({
			data: {
				name: data.name,
				email: data.email,
				password: hashedPassword,
				image: data.image || "",
				location: data.location || "",
				preferences: {
					create: {
						cuisines: data.preferences?.cuisines || [],
					},
				},
				dietaryRestrictions: {
					create: {
						vegetarian: data.dietaryRestrictions?.vegetarian || false,
						vegan: data.dietaryRestrictions?.vegan || false,
						kosher: data.dietaryRestrictions?.kosher || false,
						glutenFree: data.dietaryRestrictions?.glutenFree || false,
						dairyFree: data.dietaryRestrictions?.dairyFree || false,
						allergies: data.dietaryRestrictions?.allergies || [],
					},
				},
				availableAppliances: {
					create: {
						airFryer: data.availableAppliances?.airFryer || false,
						microwave: data.availableAppliances?.microwave || false,
						oven: data.availableAppliances?.oven || false,
						stoveTop: data.availableAppliances?.stoveTop || false,
						sousVide: data.availableAppliances?.sousVide || false,
						deepFryer: data.availableAppliances?.deepFryer || false,
						blender: data.availableAppliances?.blender || false,
						instantPot: data.availableAppliances?.instantPot || false,
					},
				},
				dietaryGoals: {
					create: {
						protein: data.dietaryGoals?.protein || 0,
						carbs: data.dietaryGoals?.carbs || 0,
						fats: data.dietaryGoals?.fats || 0,
					},
				},
				ingredientsList: {
					create: data.ingredientsList?.map(ingredient => ({
						ingredient: ingredient.ingredient,
						quantity: ingredient.quantity
					})) || []
				}
			},
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
				ingredientsList: true
			},
		});
	}

	static async findByEmail(email) {
		return prisma.user.findUnique({
			where: { email },
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
				ingredientsList: true
			},
		});
	}

	static async findById(id) {
		return prisma.user.findUnique({
			where: { id },
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
				ingredientsList: true
			},
		});
	}

	static async findOne(query) {
		return prisma.user.findFirst({
			where: query,
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
				ingredientsList: true
			},
		});
	}

	static async update(id, data) {
		if (data.password) {
			data.password = await bcrypt.hash(data.password, 10);
		}

		return prisma.user.update({
			where: { id },
			data: {
				...data,
				preferences: data.preferences ? {
					update: {
						cuisines: data.preferences.cuisines,
					},
				} : undefined,
				dietaryRestrictions: data.dietaryRestrictions ? {
					update: {
						...data.dietaryRestrictions,
						allergies: data.dietaryRestrictions.allergies || [],
					},
				} : undefined,
				availableAppliances: data.availableAppliances ? {
					update: data.availableAppliances,
				} : undefined,
				dietaryGoals: data.dietaryGoals ? {
					update: data.dietaryGoals,
				} : undefined,
			},
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
			},
		});
	}

	static async delete(id) {
		return prisma.user.delete({
			where: { id },
		});
	}

	static async matchPassword(enteredPassword, hashedPassword) {
		return bcrypt.compare(enteredPassword, hashedPassword);
	}
}

export default User;
