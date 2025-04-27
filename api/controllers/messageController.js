import Message from "../models/Message.js";
import { getConnectedUsers, getIO } from "../socket/socket.server.js";
import prisma from "../config/db.js";

export const sendMessage = async (req, res) => {
	try {
		const { content, receiverId } = req.body;

		// Validate input
		if (!content || !receiverId) {
			return res.status(400).json({
				success: false,
				message: "Content and receiverId are required"
			});
		}

		// Check if receiver exists
		const receiver = await prisma.user.findUnique({
			where: { id: receiverId }
		});

		if (!receiver) {
			return res.status(404).json({
				success: false,
				message: "Receiver not found"
			});
		}

		const newMessage = await Message.create({
			sender: req.user.id,
			receiver: receiverId,
			content,
		});

		const io = getIO();
		const connectedUsers = getConnectedUsers();
		const receiverSocketId = connectedUsers.get(receiverId);

		if (receiverSocketId) {
			io.to(receiverSocketId).emit("newMessage", {
				message: newMessage,
			});
		}

		res.status(201).json({
			success: true,
			message: newMessage,
		});
	} catch (error) {
		console.error("Error in sendMessage: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};

export const getConversation = async (req, res) => {
	const { userId } = req.params;
	
	try {
		// Validate input
		if (!userId) {
			return res.status(400).json({
				success: false,
				message: "User ID is required"
			});
		}

		// Check if user exists
		const user = await prisma.user.findUnique({
			where: { id: userId }
		});

		if (!user) {
			return res.status(404).json({
				success: false,
				message: "User not found"
			});
		}

		const messages = await Message.findByUsers(req.user.id, userId);

		res.status(200).json({
			success: true,
			messages,
		});
	} catch (error) {
		console.error("Error in getConversation: ", error);
		res.status(500).json({
			success: false,
			message: "Internal server error",
			error: process.env.NODE_ENV === 'development' ? error.message : undefined
		});
	}
};
