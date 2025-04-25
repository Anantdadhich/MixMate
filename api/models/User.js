import bcrypt from 'bcryptjs';
import prisma from '../config/db.js';

class User {
	static async create(data) {
		const hashedPassword = await bcrypt.hash(data.password, 10);
		return prisma.user.create({
			data: {
				...data,
				password: hashedPassword,
				preferences: {
					create: {
						cuisines: data.preferences?.cuisines || [],
					},
				},
				dietaryRestrictions: {
					create: {
						...data.dietaryRestrictions,
						allergies: data.dietaryRestrictions?.allergies || [],
					},
				},
				availableAppliances: {
					create: data.availableAppliances || {},
				},
				dietaryGoals: {
					create: data.dietaryGoals || {},
				},
			},
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
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
