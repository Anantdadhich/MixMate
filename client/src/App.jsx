import { Navigate, Route, Routes } from "react-router-dom";
import React from 'react';
import HomePage from "./pages/HomePage";
import AuthPage from "./pages/AuthPage";
import ProfilePage from "./pages/ProfilePage";
import ChatPage from "./pages/ChatPage";
import FridgePage from "./pages/FridgePage";
import FavoritesPage from './pages/FavoritesPage';
import MatchesPage from './pages/MatchesPage';
import LandingPage from './pages/LandingPage';
import { useAuthStore } from "./store/useAuthStore";
import { useEffect } from "react";
import { Toaster } from "react-hot-toast";

function App() {
	const { checkAuth, authUser, checkingAuth } = useAuthStore();

	useEffect(() => {
		checkAuth();
	}, [checkAuth]);

	if (checkingAuth) return null;

	return (
		<div className='min-h-screen bg-gradient-to-br from-pink-50 to-purple-50'>
			<Routes>
				<Route path='/' element={authUser ? <HomePage /> : <LandingPage />} />
				<Route path='/auth' element={!authUser ? <AuthPage /> : <Navigate to={"/"} />} />
				<Route path='/profile' element={authUser ? <ProfilePage /> : <Navigate to={"/auth"} />} />
				<Route path='/chat/:id' element={authUser ? <ChatPage /> : <Navigate to={"/auth"} />} />
				<Route path='/fridge' element={authUser ? <FridgePage /> : <Navigate to={"/auth"} />} />
				<Route path="/favorites" element={authUser ? <FavoritesPage /> : <Navigate to={"/auth"} />} />
				<Route path="/matches" element={authUser ? <MatchesPage /> : <Navigate to={"/auth"} />} />
			</Routes>

			<Toaster />
		</div>
	);
}

export default App;
