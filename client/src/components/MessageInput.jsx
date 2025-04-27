import { useEffect, useRef, useState } from "react";
import { useMessageStore } from "../store/useMessageStore";
import { Send, Smile } from "lucide-react";
import EmojiPicker from "emoji-picker-react";
import React from 'react';

const MessageInput = ({ match }) => {
	const [message, setMessage] = useState("");
	const [showEmojiPicker, setShowEmojiPicker] = useState(false);
	const emojiPickerRef = useRef(null);

	const { sendMessage } = useMessageStore();

	const handleSendMessage = (e) => {
		e.preventDefault();
		if (message.trim()) {
			sendMessage(match.id, message);
			setMessage("");
		}
	};

	useEffect(() => {
		const handleClickOutside = (event) => {
			if (emojiPickerRef.current && !emojiPickerRef.current.contains(event.target)) {
				setShowEmojiPicker(false);
			}
		};

		document.addEventListener("mousedown", handleClickOutside);
		return () => {
			document.removeEventListener("mousedown", handleClickOutside);
		};
	}, []);

	return (
		<form onSubmit={handleSendMessage} className='flex relative bg-white rounded-lg shadow-md p-2'>
			<button
				type='button'
				onClick={() => setShowEmojiPicker(!showEmojiPicker)}
				className='absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-pink-500 focus:outline-none transition-colors'
			>
				<Smile size={24} />
			</button>

			<input
				type='text'
				value={message}
				onChange={(e) => setMessage(e.target.value)}
				className='flex-grow p-3 pl-12 pr-4 rounded-lg border-2 border-pink-200 
				focus:outline-none focus:ring-2 focus:ring-pink-300 focus:border-pink-300
				placeholder-gray-400 text-gray-700'
				placeholder='Type a message...'
			/>

			<button
				type='submit'
				className='ml-2 bg-pink-500 text-white p-3 rounded-lg 
				hover:bg-pink-600 transition-colors focus:outline-none focus:ring-2 focus:ring-pink-300
				disabled:opacity-50 disabled:cursor-not-allowed'
				disabled={!message.trim()}
			>
				<Send size={24} />
			</button>

			{showEmojiPicker && (
				<div ref={emojiPickerRef} className='absolute bottom-16 left-4 z-10'>
					<EmojiPicker
						onEmojiClick={(emojiObject) => {
							setMessage((prevMessage) => prevMessage + emojiObject.emoji);
						}}
					/>
				</div>
			)}
		</form>
	);
};

export default MessageInput;
