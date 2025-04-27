import { useState, useRef } from 'react';
import { Mic, Square, Loader } from 'lucide-react';
import { useUserStore } from '../store/useUserStore';
import { useAuthStore } from '../store/useAuthStore';
import toast from 'react-hot-toast';
import React from 'react';

const VoiceIngredientInput = () => {
  const { authUser } = useAuthStore();
  const { updateProfile } = useUserStore();
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [transcriptionText, setTranscriptionText] = useState('');
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(chunksRef.current, { type: 'audio/wav' });
        await processAudioData(audioBlob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      toast.success('Recording started');
    } catch (error) {
      console.error('Error starting recording:', error);
      toast.error('Failed to start recording. Please check microphone permissions.');
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      toast.success('Recording stopped');
    }
  };

  const processAudioData = async (audioBlob) => {
    try {
      setIsProcessing(true);
      const formData = new FormData();
      formData.append('audio', audioBlob);

      const response = await fetch('/api/transcribe', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        throw new Error('Transcription failed');
      }

      const data = await response.json();
      const transcription = data.text;
      setTranscriptionText(transcription);

      // Parse the transcription for ingredients
      const ingredients = parseIngredients(transcription);
      if (ingredients.length > 0) {
        const currentIngredients = authUser?.ingredientsList || [];
        const updatedIngredients = [...currentIngredients, ...ingredients];
        await updateProfile({ ingredientsList: updatedIngredients });
        toast.success('Ingredients added successfully');
      } else {
        toast.error('No valid ingredients found in the recording');
      }
    } catch (error) {
      console.error('Error processing audio:', error);
      toast.error('Failed to process audio');
    } finally {
      setIsProcessing(false);
    }
  };

  const parseIngredients = (text) => {
    // Simple parsing logic - can be enhanced based on your needs
    const ingredients = [];
    const lines = text.split('\n');
    
    for (const line of lines) {
      const match = line.match(/(.+?)\s*-\s*(.+)/);
      if (match) {
        ingredients.push({
          ingredient: match[1].trim(),
          quantity: match[2].trim()
        });
      }
    }
    
    return ingredients;
  };

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isRecording ? stopRecording : startRecording}
        disabled={isProcessing}
        className={`p-2 rounded-full ${
          isRecording
            ? 'bg-red-500 text-white'
            : 'bg-pink-500 text-white hover:bg-pink-600'
        } transition-colors`}
      >
        {isRecording ? <Square size={20} /> : <Mic size={20} />}
      </button>
      
      {isProcessing && (
        <div className="flex items-center gap-2">
          <Loader className="w-5 h-5 animate-spin text-pink-500" />
          <span className="text-sm text-gray-600">Processing...</span>
        </div>
      )}
      
      {transcriptionText && !isProcessing && (
        <div className="text-sm text-gray-600">
          Last transcription: {transcriptionText}
        </div>
      )}
    </div>
  );
};

export default VoiceIngredientInput;
