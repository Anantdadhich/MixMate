import React, { useEffect } from 'react';
import { useMatchStore } from '../store/useMatchStore';
import { useAuthStore } from '../store/useAuthStore';
import { Link } from 'react-router-dom';
import { MessageSquare, UserX } from 'lucide-react';
import { Loader } from 'lucide-react';

const MatchesPage = () => {
    const { getMyMatches, matches, isLoadingMyMatches } = useMatchStore();
    const { authUser } = useAuthStore();

    useEffect(() => {
        if (authUser) {
            getMyMatches();
        }
    }, [authUser, getMyMatches]);

    if (isLoadingMyMatches) {
        return (
            <div className="flex items-center justify-center h-screen">
                <Loader className="w-8 h-8 animate-spin text-pink-500" />
            </div>
        );
    }

    if (!matches || matches.length === 0) {
        return (
            <div className="flex flex-col items-center justify-center h-screen">
                <UserX className="w-16 h-16 text-gray-400 mb-4" />
                <h2 className="text-2xl font-semibold text-gray-800 mb-2">No Matches Yet</h2>
                <p className="text-gray-600 mb-4">Start swiping to find your perfect match!</p>
                <Link
                    to="/"
                    className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                >
                    Go to Home
                </Link>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">Your Matches</h1>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {matches.map((match) => (
                    <div
                        key={match.id}
                        className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow"
                    >
                        <div className="flex items-center mb-4">
                            <img
                                src={match.image || "/avatar.png"}
                                alt={match.name}
                                className="w-16 h-16 rounded-full object-cover mr-4 border-2 border-pink-300"
                            />
                            <div>
                                <h3 className="text-xl font-semibold text-gray-800">{match.name}</h3>
                                <p className="text-gray-600">Match Score: {match.score}%</p>
                            </div>
                        </div>
                        <Link
                            to={`/chat/${match.id}`}
                            className="flex items-center justify-center w-full px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors"
                        >
                            <MessageSquare className="w-5 h-5 mr-2" />
                            Start Chat
                        </Link>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default MatchesPage; 