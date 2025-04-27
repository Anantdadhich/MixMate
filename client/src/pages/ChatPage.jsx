import { useEffect } from "react";
import { Header } from "../components/Header";
import React from 'react';
import { useAuthStore } from "../store/useAuthStore";
import { useMatchStore } from "../store/useMatchStore";
import { useMessageStore } from "../store/useMessageStore";
import { Link, useParams } from "react-router-dom";
import { Loader, UserX, ArrowLeft } from "lucide-react";
import MessageInput from "../components/MessageInput";
import MatchScore from "../components/MatchScore";

const ChatPage = () => {
	const { getMyMatches, matches, isLoadingMyMatches } = useMatchStore();
	const { messages, getMessages, subscribeToMessages, unsubscribeFromMessages } = useMessageStore();
	const { authUser } = useAuthStore();

	const { id } = useParams();

	const match = matches.find((m) => m?.id === id);

	useEffect(() => {
		if (authUser && id) {
			getMyMatches();
			getMessages(id);
			subscribeToMessages();
		}

		return () => {
			unsubscribeFromMessages();
		};
	}, [getMyMatches, authUser, getMessages, subscribeToMessages, unsubscribeFromMessages, id]);

	if (isLoadingMyMatches) return <LoadingMessagesUI />;
	if (!match) return <MatchNotFound />;

	return (
		<div className='flex flex-col h-screen bg-gradient-to-br from-pink-50 to-purple-50'>
			<Header />

			<div className='flex-grow flex flex-col p-4 md:p-6 lg:p-8 overflow-hidden max-w-4xl mx-auto w-full'>
				<div className='flex items-center justify-between mb-4 bg-white rounded-lg shadow-md p-4'>
					<div className="flex items-center">
						<Link to="/matches" className="mr-4 text-gray-600 hover:text-pink-500 transition-colors">
							<ArrowLeft size={24} />
						</Link>
						<img
							src={match.image || "/avatar.png"}
							className='w-12 h-12 object-cover rounded-full mr-3 border-2 border-pink-300'
							alt={match.name}
						/>
						<div>
							<h2 className='text-xl font-semibold text-gray-800'>{match.name}</h2>
							<p className='text-sm text-gray-500'>Match Score</p>
						</div>
					</div>
					<MatchScore score={match.score || match.compatibilityScore?.score || 0} />
				</div>

				<div className='flex-grow overflow-y-auto mb-4 bg-white rounded-lg shadow-md p-4'>
					{messages.length === 0 ? (
						<div className="flex flex-col items-center justify-center h-full text-gray-500">
							<div className="text-center">
								<p className="text-lg mb-2">No messages yet</p>
								<p className="text-sm">Start the conversation with {match.name}!</p>
							</div>
						</div>
					) : (
						<div className="space-y-4">
							{messages.map((message) => (
								<div
									key={message.id}
									className={`flex ${message.senderId === authUser.id ? 'justify-end' : 'justify-start'}`}
								>
									<div
										className={`max-w-[70%] rounded-lg p-3 ${
											message.senderId === authUser.id
												? 'bg-pink-500 text-white rounded-br-none'
												: 'bg-gray-100 text-gray-800 rounded-bl-none'
										}`}
									>
										{message.content}
									</div>
								</div>
							))}
						</div>
					)}
				</div>

				<MessageInput match={match} />
			</div>
		</div>
	);
};

const MatchNotFound = () => (
	<div className='flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50'>
		<div className="bg-white p-8 rounded-lg shadow-md text-center">
			<UserX className='w-16 h-16 text-gray-400 mb-4 mx-auto' />
			<h2 className='text-2xl font-semibold text-gray-800 mb-2'>Match Not Found</h2>
			<p className='text-gray-600 mb-6'>The match you're looking for doesn't exist or has been removed.</p>
			<Link
				to='/matches'
				className='inline-flex items-center px-6 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors'
			>
				<ArrowLeft className="mr-2" size={20} />
				Back to Matches
			</Link>
		</div>
	</div>
);

const LoadingMessagesUI = () => (
	<div className='flex flex-col items-center justify-center h-screen bg-gradient-to-br from-pink-50 to-purple-50'>
		<div className="bg-white p-8 rounded-lg shadow-md text-center">
			<Loader className='w-16 h-16 text-pink-500 animate-spin mb-4 mx-auto' />
			<p className='text-gray-600'>Loading messages...</p>
		</div>
	</div>
);

export default ChatPage;
