# Cloud Learning Simulator

![Gameplay Demo](assets/gameplay.gif)

**Cloud Learning Simulator** is an interactive 3D educational platform that transforms the original Server Survival game into a comprehensive cloud computing learning experience. Built with a modular architecture, it features multiple learning modes, progress tracking, and professional navigation systems.

[![PLAY NOW](https://img.shields.io/badge/PLAY_NOW-Cloud_Learning_Simulator-2ea44f?style=for-the-badge)](index.html)

## Features

### 🎮 Multiple Learning Modes

#### **Play Mode**
- **Survival Mode**: Original Server Survival gameplay with educational context
- **Challenge Mode**: Focused 3-5 minute scenarios targeting specific cloud concepts
- **Sandbox Mode**: Free experimentation with AI assistant guidance

#### **Learn Mode**
- **Interactive Tutorials**: Step-by-step guided learning with progress tracking
- **Concept Explorer**: Deep dive into cloud computing fundamentals
- **Video Library**: Curated educational content with integrated learning paths

#### **Analysis Mode**
- **Performance Analytics**: Track your learning progress and skill development
- **Detailed Reports**: Comprehensive analysis of your strengths and areas for improvement
- **AI-Powered Insights**: Personalized recommendations for optimal learning

#### **Profile Mode**
- **Comprehensive Settings**: Audio, gameplay, privacy, and language preferences
- **Achievement System**: Unlock badges and track learning milestones
- **Progress Visualization**: Visual representation of your learning journey

### 🏗️ Modern Architecture

- **Modular Design**: Clean separation of concerns with ES6 modules
- **Event-Driven**: Loose coupling between components for scalability
- **State Management**: Centralized state with persistence and real-time updates
- **Responsive UI**: Professional interface that works on all devices

### 🎨 Professional User Experience

- **Smooth Navigation**: Instant mode switching without page reloads
- **Loading States**: Professional transitions with progress indicators
- **Dark Theme**: Modern glassmorphism design with blue accents
- **Shared Navigation**: Consistent navbar across all application modes

## How to Use

### Getting Started

1. **Landing Page**: Start at `index.html` for an overview of features
2. **Dashboard**: Navigate to `dashboard.html` for your learning hub
3. **Play**: Access `play.html` for the interactive 3D simulation
4. **Learn**: Visit `learn.html` for tutorials and educational content
5. **Analysis**: Check `analysis.html` for performance insights
6. **Profile**: Manage settings at `profile.html`

### Navigation

- **Shared Navbar**: Available on all pages for seamless navigation
- **Mode Controllers**: Each section has specialized functionality and submodes
- **State Preservation**: Your progress and settings are maintained across sessions
- **Responsive Design**: Optimized for desktop, tablet, and mobile devices

## Tech Stack

- **Core:** Vanilla JavaScript (ES6+) with modular architecture
- **Rendering:** [Three.js](https://threejs.org/) for 3D visualization
- **Styling:** [Tailwind CSS](https://tailwindcss.com/) for modern UI components
- **Architecture:** Event-driven design with centralized state management
- **Build:** No build step required! Standard HTML/CSS/JS modules

## Project Structure

```
├── index.html              # Professional landing page
├── dashboard.html          # Learning hub and user stats
├── play.html              # Interactive 3D simulation
├── learn.html             # Tutorials and educational content
├── analysis.html          # Performance analytics
├── profile.html           # Settings and achievements
├── shared/                # Shared navigation components
│   ├── navbar.html
│   └── navbar.js
├── src/                   # Modular application code
│   ├── core/             # Core system modules
│   ├── controllers/      # Mode-specific controllers
│   ├── ui/              # UI components and integration
│   ├── entities/        # Data models
│   ├── services/        # Service layer
│   └── locales/         # Internationalization
├── assets/              # Media and static files
└── game.js             # Original game logic (preserved)
```

## Getting Started

1. Clone the repository
2. Open `index.html` in your modern web browser
3. Navigate through the different learning modes
4. Start your cloud computing learning journey!

## Development

The application uses a modular architecture with ES6 modules:

- **ApplicationController**: Main application coordinator
- **ModeControllerManager**: Manages navigation between different modes
- **StateManager**: Centralized state management with persistence
- **EventSystem**: Event-driven communication between components
- **Router**: Client-side routing for seamless navigation

## Phase 2 Complete

This version represents the completion of Phase 2: Dashboard and Navigation System, featuring:

- ✅ Complete navigation system with smooth transitions
- ✅ Professional dashboard with user statistics
- ✅ Mode controllers for all major sections
- ✅ Comprehensive testing and validation
- ✅ Modern UI/UX with responsive design

For detailed implementation notes, see `PHASE2_COMPLETE.md`.

## Community

Join our Discord server to discuss learning strategies and share your progress:
[Join Discord](https://discord.gg/f38NgHDwnK)

---

_Transforming cloud learning through interactive simulation._
