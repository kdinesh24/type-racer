# TypeRace - Real-time Competitive Typing

A modern, competitive typing race application built with Next.js, TypeScript, and Socket.io. Experience real-time multiplayer typing races with a beautiful, responsive interface and clean architecture.

> 🏗️ **Recently Refactored**: This codebase has been completely restructured with modern architecture patterns. See [ARCHITECTURE.md](./ARCHITECTURE.md) for detailed information about the new structure.

## 🚀 Features

### Core Functionality
- **Real-time multiplayer racing** - Compete with other players simultaneously
- **Practice Mode** - Solo practice sessions to improve your typing skills
- **Global Races** - Join worldwide competitions with instant matchmaking
- **Private Rooms** - Create custom rooms and race with friends
- **Live statistics** - Real-time WPM (Words Per Minute) and accuracy tracking
- **Dynamic text generation** - Various text sources including quotes and paragraphs
- **Progress tracking** - Visual progress bars and live race updates

### User Experience
- **Clear Navigation** - Intuitive navigation with tooltips and clear indicators
- **Separate Routes** - Dedicated pages for each game mode
- **Modern UI/UX** - Clean, minimalist design with smooth animations
- **Responsive design** - Optimized for desktop, tablet, and mobile devices
- **Real-time feedback** - Color-coded typing feedback (correct/incorrect characters)
- **Countdown system** - Automated race start with countdown timer
- **Results display** - Comprehensive race results with rankings

### Technical Features
- **WebSocket communication** - Real-time bidirectional communication
- **TypeScript** - Full type safety and better development experience
- **State management** - Zustand for efficient state management
- **Performance optimized** - Smooth typing experience with minimal latency
- **Error handling** - Robust error handling and user feedback

## 🛠️ Technology Stack

### Frontend
- **Next.js 15** - React framework with App Router
- **TypeScript** - Static type checking
- **Tailwind CSS** - Utility-first CSS framework
- **Framer Motion** - Smooth animations and transitions
- **React Icons** - Beautiful icon library
- **Zustand** - Lightweight state management

### Backend
- **Node.js** - JavaScript runtime
- **Express.js** - Web application framework
- **Socket.io** - Real-time WebSocket communication
- **TypeScript** - Type-safe backend development

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ installed on your machine
- npm or yarn package manager

### Installation

1. **Install dependencies**
   ```bash
   npm install --legacy-peer-deps
   ```

2. **Start the development servers**
   
   In one terminal, start the WebSocket server:
   ```bash
   npm run server
   ```
   
   In another terminal, start the Next.js development server:
   ```bash
   npm run dev
   ```

3. **Open the application**
   Navigate to `http://localhost:3000` in your browser

## 🎮 How to Play

1. **Enter Username** - Start by entering your desired username
2. **Join Race** - You'll be automatically matched with other players
3. **Wait for Players** - Races start when at least 2 players join
4. **Countdown** - A 5-second countdown begins before the race
5. **Type!** - Type the displayed text as fast and accurately as possible
6. **Track Progress** - Monitor your WPM, accuracy, and position in real-time
7. **View Results** - See final rankings and statistics when the race ends

Built with ❤️ using Next.js, TypeScript, and Socket.io
