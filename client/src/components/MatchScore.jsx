import React from 'react';
import { motion } from 'framer-motion';

const MatchScore = ({ score }) => {
  // Extract the numeric score from the score object
  const matchScore = typeof score === 'object' ? score.score : score;

  // Determine color based on match percentage
  const getScoreColor = () => {
    if (matchScore < 33) return 'bg-red-500';
    if (matchScore < 66) return 'bg-yellow-500';
    return 'bg-green-500';
  };

  const waveVariants = {
    animate: {
      y: [0, -2, 0],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const liquidWaveVariants = {
    animate: {
      d: [
        "M 0 50 Q 30 45, 60 50 Q 90 55, 120 50 L 120 120 L 0 120 Z",
        "M 0 50 Q 30 55, 60 50 Q 90 45, 120 50 L 120 120 L 0 120 Z"
      ],
      transition: {
        duration: 2,
        repeat: Infinity,
        repeatType: "reverse",
        ease: "easeInOut"
      }
    }
  };

  const scoreVariants = {
    initial: { scale: 0.5, opacity: 0 },
    animate: { 
      scale: 1, 
      opacity: 1,
      transition: { 
        type: "spring",
        stiffness: 260,
        damping: 20,
        delay: 0.1
      }
    }
  };

  return (
    <div className="relative w-24 h-24">
      <motion.div
        className={`absolute inset-0 rounded-full ${getScoreColor()} overflow-hidden`}
        variants={waveVariants}
        animate="animate"
      >
        <svg className="w-full h-full" viewBox="0 0 120 120">
          <motion.path
            fill="currentColor"
            variants={liquidWaveVariants}
            animate="animate"
          />
        </svg>
      </motion.div>
      <motion.div
        className="absolute inset-0 flex items-center justify-center text-white font-bold text-xl"
        variants={scoreVariants}
        initial="initial"
        animate="animate"
      >
        {matchScore}%
      </motion.div>
    </div>
  );
};

export default MatchScore;
