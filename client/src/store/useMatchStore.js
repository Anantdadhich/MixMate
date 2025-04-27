import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { getSocket } from "../socket/socket.client";

export const useMatchStore = create((set) => ({
	matches: [],
	isLoadingMyMatches: false,
	isLoadingUserProfiles: false,
	userProfiles: [],
	swipeFeedback: null,

	getMyMatches: async () => {
		try {
			set({ isLoadingMyMatches: true });
			const res = await axiosInstance.get("/matches");
			if (res?.data?.matches) {
				const formattedMatches = res.data.matches.map(match => ({
					...match,
					id: match.id || match._id
				}));
				set({ matches: formattedMatches });
			} else {
				set({ matches: [] });
				toast.error("Failed to load matches");
			}
		} catch (error) {
			console.error("Error fetching matches:", error);
			set({ matches: [] });
			toast.error(error?.response?.data?.message || "Failed to load matches");
		} finally {
			set({ isLoadingMyMatches: false });
		}
	},

	getUserProfiles: async () => {
		try {
			set({ isLoadingUserProfiles: true });
			const res = await axiosInstance.get("/matches/user-profiles");
			if (res?.data?.users) {
				const formattedUsers = res.data.users.map(user => ({
					...user,
					id: user.id || user._id
				}));
				set({ userProfiles: formattedUsers });
			} else {
				set({ userProfiles: [] });
				toast.error("Failed to load user profiles");
			}
		} catch (error) {
			console.error("Error fetching user profiles:", error);
			set({ userProfiles: [] });
			toast.error(error?.response?.data?.message || "Failed to load user profiles");
		} finally {
			set({ isLoadingUserProfiles: false });
		}
	},

	swipeLeft: async (user) => {
		try {
			if (!user?.id) {
				toast.error("Invalid user");
				return;
			}
			set({ swipeFeedback: "passed" });
			await axiosInstance.post("/matches/swipe-left/" + user.id);
		} catch (error) {
			console.error("Error swiping left:", error);
			toast.error(error?.response?.data?.message || "Failed to swipe left");
		} finally {
			setTimeout(() => set({ swipeFeedback: null }), 1500);
		}
	},

	swipeRight: async (user) => {
		try {
			if (!user?.id) {
				toast.error("Invalid user");
				return;
			}
			set({ swipeFeedback: "liked" });
			await axiosInstance.post("/matches/swipe-right/" + user.id);
		} catch (error) {
			console.error("Error swiping right:", error);
			toast.error(error?.response?.data?.message || "Failed to swipe right");
		} finally {
			setTimeout(() => set({ swipeFeedback: null }), 1500);
		}
	},

	subscribeToNewMatches: () => {
		try {
			const socket = getSocket();
			if (!socket) {
				console.error("Socket not initialized");
				return;
			}

			socket.on("newMatch", (newMatch) => {
				if (newMatch) {
					set((state) => ({
						matches: [...state.matches, newMatch],
					}));
					toast.success("You got a new match!");
				}
			});
		} catch (error) {
			console.error("Error subscribing to new matches:", error);
		}
	},

	unsubscribeFromNewMatches: () => {
		try {
			const socket = getSocket();
			if (socket) {
				socket.off("newMatch");
			}
		} catch (error) {
			console.error("Error unsubscribing from new matches:", error);
		}
	},
}));
