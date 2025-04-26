import { Server } from "socket.io";

let io;

const connectedUsers = new Map();
// { userId: socketId }

export const initializeSocket = (httpServer) => {
	io = new Server(httpServer, {
		cors: {
			origin: [process.env.CLIENT_URL, 'http://localhost:5173', 'http://localhost:3000'],
			credentials: true,
			methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
			allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With'],
		},
		transports: ['websocket', 'polling'],
	});

	io.use((socket, next) => {
		const userId = socket.handshake.auth.userId;
		if (!userId) {
			console.error("Invalid user ID in socket connection");
			return next(new Error("Invalid user ID"));
		}

		socket.userId = userId;
		next();
	});

	io.on("connection", (socket) => {
		console.log(`User connected with socket id: ${socket.id}`);
		connectedUsers.set(socket.userId, socket.id);

		socket.on("disconnect", () => {
			console.log(`User disconnected with socket id: ${socket.id}`);
			connectedUsers.delete(socket.userId);
		});

		socket.on("error", (error) => {
			console.error("Socket error:", error);
		});
	});
};

export const getIO = () => {
	if (!io) {
		throw new Error("Socket.io not initialized!");
	}
	return io;
};

export const getConnectedUsers = () => connectedUsers;
