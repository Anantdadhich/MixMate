import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";
import { useAuthStore } from "./useAuthStore";

export const useMessageStore = create((set) => ({
	messages: [],
	loading: true,

	sendMessage: async (receiverId, content) => {
		try {
			if (!receiverId) {
				toast.error("Invalid receiver");
				return;
			}
			const authUser = useAuthStore.getState().authUser;
			if (!authUser?.id) {
				toast.error("You must be logged in to send messages");
				return;
			}
			// mockup a message, show it in the chat immediately
			set((state) => ({
				messages: [
					...state.messages,
					{ _id: Date.now(), sender: authUser.id, content },
				],
			}));
			const res = await axiosInstance.post("/messages/send", { receiverId, content });
			console.log("message sent", res.data);
		} catch (error) {
			toast.error(error.response?.data?.message || "Failed to send message");
		}
	},

	getMessages: async (userId) => {
		try {
			if (!userId) {
				set({ messages: [], loading: false });
				return;
			}
			set({ loading: true });
			const res = await axiosInstance.get(`/messages/conversation/${userId}`);
			set({ messages: res.data.messages || [] });
		} catch (error) {
			console.error("Error fetching messages:", error);
			set({ messages: [] });
			toast.error("Failed to load messages");
		} finally {
			set({ loading: false });
		}
	},

	subscribeToMessages: () => {
		try {
			const socket = getSocket();
			socket.on("newMessage", ({ message }) => {
				set((state) => ({ messages: [...state.messages, message] }));
			});
		} catch (error) {
			console.error("Error subscribing to messages:", error);
		}
	},

	unsubscribeFromMessages: () => {
		try {
			const socket = getSocket();
			socket.off("newMessage");
		} catch (error) {
			console.error("Error unsubscribing from messages:", error);
		}
	},
}));
