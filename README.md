# MixMatch

**Reduce Food Waste, Create Connections**

MixMatch is a social cooking platform designed to tackle food waste and isolation in the kitchen. By matching users with similar ingredients and dietary goals, then generating AI-powered recipes for them to cook together, MixMatch turns leftover ingredients into shared, healthy meals—and new friendships.

---

## Problem Statement

Every year, nearly 40% of fruits and vegetables in India goes to waste . At the same time, many people feel lonely or uninspired when cooking alone, often defaulting to takeout. This leads to wasted groceries, unhealthy eating, and missed social connections.So with this platfrom  you connect with others with your matching score and you like after like the user profile by swiping right the Grok will generate the reciepe

## Solution Overview

MixMatch solves these problems by:

1. **Social Matching**: Letting users create profiles with dietary goals, allergies, kitchen tools, and current ingredients.  
2. **Swipe-Based Discovery**: Enabling users to swipe right/left on potential cooking partners based on pantry overlap and diet compatibility.  
3. **In-App Chat**: Providing real-time messaging (via Socket.IO) to plan cooking sessions and refine ingredient lists.  
4. **AI-Generated Recipes**: Using Groq AI to analyze both users' ingredients and preferences, then instantly generate a customized recipe with grok ai.  


## Key Features

- **User Profiles**: Dietary goals, restrictions, cuisine preferences, allergies, location, appliances, and dynamic ingredient lists.  
- **Multi-Modal Ingredient Input**: Photo OCR (Groq API), voice-to-text (Deepgram), manual entry.  
- **Swipe Matching**: Familiar mobile-style swipe UX for finding cooking partners.  
- **Real-Time Chat**: Stable, low-latency messaging with Socket.IO.  
- **AI Recipe Engine**: Groq AI creates recipes tailored to combined pantries and diet requirements.  
- **Impact Dashboard**: Visualize pounds of food saved and earned eco-badges.

## Tech Stack

| Layer           | Technology                   |
|-----------------|------------------------------|
| Frontend        | React, Vite, Tailwind CSS    |
| Backend         | Node.js, Express             |
| Database        | Prisma ORM,NeonTech                  |
| Real-Time Chat  | Socket.IO                    |
| Image OCR & AI  | Groq API                     |
| Nutrition Data  | Calorie Ninja API            |


## Architecture

1. **Client (React)**: Renders swipe cards, chat UI, recipe view, and dashboard.  
2. **Server (Express)**: Exposes REST endpoints for user, match, recipe, and profile updates; handles Socket.IO events.  
3. **AI/ML Services**: Groq API for image-to-text and recipe generation; 
4. **Database (MongoDB)**: Stores user profiles, ingredient lists, match history, messages, and wasted-food logs.  

## Getting Started

### Prerequisites

- Node.js v16+  
- npm 


### Installation

1. **Clone the repo**  
```bash
git clone https://github.com/Anantdadhich/MixMate
cd api 
cd client
```
2. **Install dependencies**  
```bash
npm install      
```


## Future Work

- **Macro-Tunable Recipes**: Let users adjust calorie/protein targets before generating recipes.  
- **Mobile Apps**: Native iOS/Android clients for on-the-go cooking.  
- **Push Notifications**: Alerts for new matches, messages, and cooking reminders.  
- **Voice-Controlled Cooking**: Hands-free recipe navigation with voice commands.  
- **Multi-Language Support**: Expand OCR and UI to regional languages.
- **WorkingonImageandVoiceApi** : Image and Voice ingredient recognition  working on these issue

