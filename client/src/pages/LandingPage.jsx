import React from 'react';
import { Link } from 'react-router-dom';
import { ChefHat, Heart, MessageSquare, Utensils, Leaf, Users, Zap } from 'lucide-react';
import { motion } from 'framer-motion';

const LandingPage = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-100 via-emerald-50 to-teal-50 overflow-hidden">

      <div 
        className="absolute inset-0 opacity-[0.15] pointer-events-none"
        
      />
   

      <div className="container mx-auto px-4 py-16 md:py-24">
        <motion.div 
          className="flex flex-col md:flex-row items-center justify-between gap-12"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
        >
          <div className="md:w-1/2">
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-gray-800 mb-6">
              <span className="text-emerald-600">MixMatch:</span> Reduce Food Waste, Create Connections
            </h1>
            <p className="text-lg text-gray-600 mb-8">
              In a world where one-third of food goes unsold or uneaten, MixMatch empowers health-conscious individuals
              to connect with meal partners who share compatible dietary goals, overlapping ingredients, and a passion for
              sustainable, mindful living.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Link
                to="/auth"
                className="px-6 py-3 bg-emerald-500 text-white rounded-lg hover:bg-emerald-600 transition-colors text-center font-medium"
              >
                Get Started
              </Link>
              <Link
                to="/auth"
                className="px-6 py-3 border-2 border-emerald-500 text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors text-center font-medium"
              >
                Learn More
              </Link>
            </div>
          </div>
          <div className="md:w-1/2">
            <img
              src="/sust.jpg"
              alt="Sustainable Meal Partnerships"
              className="w-full rounded-lg shadow-xl"
            />
          </div>
        </motion.div>
      </div>


      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:w-1/2 ">
              <img
                src="/ai.jpeg"
                alt="AI Recipe Generation"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
            <div className="md:w-1/2">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                <span className="text-emerald-600">AI-Powered</span> Recipe Generation
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                When you find your perfect meal match, our advanced AI technology analyzes your combined ingredients 
                and dietary preferences to generate custom, nutritious recipes tailored specifically to you both.
              </p>
              <p className="text-lg text-gray-600 mb-6">
                No more wondering what to cook with your available ingredients—our AI does the creative work for you!
              </p>
            
            </div>
          </motion.div>
        </div>
      </div>

 
      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center text-gray-800 mb-12">
            Key Features
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <motion.div 
              className="bg-emerald-50 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Users className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Smart User Profiles</h3>
              <p className="text-gray-600">
                Create your profile with detailed dietary goals, restrictions, cuisine preferences, allergies, location, and available appliances.
              </p>
            </motion.div>
            <motion.div 
              className="bg-emerald-50 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.4 }}
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <ChefHat className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Effortless Ingredient Input</h3>
              <p className="text-gray-600">
                Add ingredients quickly through voice recognition (powered by Deepgram), image recognition (using Groq API), or manual entry.
              </p>
            </motion.div>
            <motion.div 
              className="bg-emerald-50 p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.6 }}
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Heart className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Intelligent Matching System</h3>
              <p className="text-gray-600">
                Discover compatible cooking partners with similar ingredients and complementary dietary needs in your area.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-emerald-50 py-16">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 0.8 }}
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <Utensils className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Personalized Recipe Suggestions</h3>
              <p className="text-gray-600">
                Receive customized recipe recommendations based on your combined ingredients and shared preferences.
              </p>
            </motion.div>
            <motion.div 
              className="bg-white p-6 rounded-lg shadow-md"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1.0 }}
            >
              <div className="w-12 h-12 bg-emerald-500 rounded-full flex items-center justify-center mb-4">
                <MessageSquare className="text-white" size={24} />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">Direct Messaging</h3>
              <p className="text-gray-600">
                Coordinate meal plans and cooking sessions easily through our integrated messaging system.
              </p>
            </motion.div>
          </div>
        </div>
      </div>

      <div className="bg-white py-16">
        <div className="container mx-auto px-4">
          <motion.div 
            className="flex flex-col md:flex-row items-center gap-12"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="md:w-1/2 order-2 md:order-1">
              <h2 className="text-3xl font-bold text-gray-800 mb-6">
                Join the <span className="text-emerald-600">Sustainable Food</span> Movement
              </h2>
              <p className="text-lg text-gray-600 mb-6">
                Together, we can reduce waste, enjoy nutritious meals, and build community—one shared meal at a time.
              </p>
              <div className="flex items-center gap-4 mb-6">
                <Leaf className="text-emerald-500" size={24} />
                <p className="text-gray-600">Reduce food waste through collaborative consumption</p>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <Users className="text-emerald-500" size={24} />
                <p className="text-gray-600">Connect with like-minded, health-conscious individuals</p>
              </div>
              <div className="flex items-center gap-4 mb-6">
                <ChefHat className="text-emerald-500" size={24} />
                <p className="text-gray-600">Discover new recipes and culinary possibilities</p>
              </div>
            </div>
            <div className="md:w-1/2 order-1 md:order-2">
              <img
                src="/img.jpg"
                alt="Sustainable Food Movement"
                className="w-full rounded-lg shadow-lg"
              />
            </div>
          </motion.div>
        </div>
      </div>


      <div className="container mx-auto px-4 py-16">
        <motion.div 
          className="bg-gradient-to-r from-emerald-500 to-teal-500 rounded-2xl p-8 md:p-12 text-center text-white"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.8 }}
        >
          <h2 className="text-3xl font-bold mb-4">Ready to Find Your Culinary Match?</h2>
          <p className="text-lg mb-8">
            Sign up today and find your first meal match within minutes!
          </p>
          <Link
            to="/auth"
            className="inline-flex items-center px-8 py-4 bg-white text-emerald-500 rounded-lg hover:bg-emerald-50 transition-colors font-medium"
          >
            <Utensils className="mr-2" size={20} />
            Get Started
          </Link>
        </motion.div>
      </div>
    </div>
  );
};

export default LandingPage;