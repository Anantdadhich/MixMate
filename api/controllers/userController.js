import cloudinary from "../config/cloudinary.js";
import User from "../models/User.js";
import prisma from "../config/db.js";

export const updateProfile = async (req, res) => {
	try {
		const { image, bio, ...otherData } = req.body;

		let updatedData = otherData;

		if (image) {
			// base64 format
			if (image.startsWith("data:image")) {
				try {
					const uploadResponse = await cloudinary.uploader.upload(image);
					updatedData.image = uploadResponse.secure_url;
				} catch (error) {
					console.error("Error uploading image:", error);
					return res.status(400).json({
						success: false,
						message: "Error uploading image",
					});
				}
			}
		}

		// Remove any fields that aren't in the schema
		const validFields = ['name', 'email', 'password', 'image', 'location'];
		const filteredData = Object.keys(updatedData)
			.filter(key => validFields.includes(key))
			.reduce((obj, key) => {
				obj[key] = updatedData[key];
				return obj;
			}, {});

		const updatedUser = await prisma.user.update({
			where: { id: req.user.id },
			data: {
				...filteredData,
				preferences: updatedData.preferences ? {
					update: {
						cuisines: updatedData.preferences.cuisines
					}
				} : undefined,
				dietaryRestrictions: updatedData.dietaryRestrictions ? {
					update: {
						...updatedData.dietaryRestrictions,
						allergies: updatedData.dietaryRestrictions.allergies || []
					}
				} : undefined,
				availableAppliances: updatedData.availableAppliances ? {
					update: updatedData.availableAppliances
				} : undefined,
				dietaryGoals: updatedData.dietaryGoals ? {
					update: updatedData.dietaryGoals
				} : undefined,
				ingredientsList: updatedData.ingredientsList ? {
					deleteMany: {},
					create: updatedData.ingredientsList.map(ingredient => ({
						ingredient: ingredient.ingredient,
						quantity: ingredient.quantity
					}))
				} : undefined
			},
			include: {
				preferences: true,
				dietaryRestrictions: true,
				availableAppliances: true,
				dietaryGoals: true,
				ingredientsList: true
			}
		});

		res.status(200).json({
			success: true,
			user: {
				id: updatedUser.id,
				name: updatedUser.name,
				email: updatedUser.email,
				image: updatedUser.image,
				location: updatedUser.location,
				preferences: updatedUser.preferences,
				dietaryRestrictions: updatedUser.dietaryRestrictions,
				availableAppliances: updatedUser.availableAppliances,
				dietaryGoals: updatedUser.dietaryGoals,
				ingredientsList: updatedUser.ingredientsList
			}
		});
	} catch (error) {
		console.error("Error in updateProfile: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};
