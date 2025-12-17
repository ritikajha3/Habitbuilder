# HabitHero

HabitHero is a gamified habit tracking application built with React and TypeScript. It transforms daily routines into an engaging RPG-like experience where consistency powers an animated avatar. The application combines task management with visual rewards, punishments, and AI-driven coaching to encourage self-improvement.

## Features

- **Gamified Progress**: Users earn Experience Points (XP) and Coins for completing tasks, leveling up their profile as they maintain consistency.
- **Interactive Avatar**: An animated robot character acts as a visual companion. It celebrates task completion with confetti and reacts with animated expressions or distress if the user breaks their daily streak.
- **Streak System**: The application tracks daily streaks. Missing a day triggers a visual lightning strike event, resetting the streak.
- **Focus Timer**: A built-in productivity tool offering both a countdown timer and a stopwatch to help users engage in deep work.
- **Calendar History**: A monthly calendar view provides a visual history of habit completion, highlighting perfect days and identifying areas for improvement.
- **AI Integration**: Powered by Google Gemini, the app provides personalized motivational quotes and intelligent habit suggestions based on the user's current routine.
- **Aesthetic Interface**: The UI features a soft pastel color palette, glassmorphism effects, and fluid animations.

## Technologies Used

- **Frontend**: React, TypeScript
- **Styling**: Tailwind CSS
- **Animations**: Framer Motion
- **Icons**: Lucide React
- **AI/LLM**: Google GenAI SDK (Gemini)
- **Date Handling**: date-fns

## Installation and Setup

1. Clone the repository to your local machine.
2. Navigate to the project directory.
3. Install the dependencies using your package manager (e.g., npm install).
4. Create a file named .env in the root directory.
5. Add your Google Gemini API key to the .env file:
   API_KEY=your_actual_api_key_here
6. Start the development server.

## Usage

### Habits Tab
This is the main dashboard. Users can add new habits, set priorities (Low, Medium, High), and mark them as complete. Completing a task rewards coins and XP.

### Focus Tab
Access the productivity timer. Toggle between Timer and Stopwatch modes. An animated companion provides visual feedback during the session.

### Calendar Tab
View historical data. Days are color-coded based on performance:
- Green: All tasks completed.
- Yellow: Partial completion.
- Red: Missed tasks.
- Grey: Future or empty days.

### AI Coaching
Click the Coach Me button to receive context-aware motivation based on your current stats (level, streak, and daily progress). Click AI Suggest to generate new habit ideas to add to your routine.

## Project Structure

- **App.tsx**: Main application component handling state, routing between tabs, and the core game loop.
- **components/**: UI components including the Avatar, HabitItem, FocusTimer, and CalendarView.
- **services/**: Integration logic for the Google Gemini API.
- **types.ts**: TypeScript interfaces for UserStats, Habits, and application state.
