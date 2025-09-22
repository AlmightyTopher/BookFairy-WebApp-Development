# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookFairy is a React web application built with Vite that helps users manage their book library. The app features a magical fairy theme with a mobile-first design approach. The original design is based on a Figma prototype available at https://www.figma.com/design/VOvALPli6sbV9MoZg7hrG6/BookFairy-WebApp-Development--Copy-.

## Development Commands

- `npm run dev` - Start development server (runs on port 3000 with auto-open)
- `npm run build` - Build for production (outputs to `build/` directory)
- `npm i` - Install dependencies

## Architecture & Key Components

### Tech Stack
- **Framework**: React 18 with TypeScript
- **Build Tool**: Vite 6.3.5 with SWC for fast compilation
- **UI Library**: Extensive use of Radix UI components for accessibility
- **Styling**: CSS with custom styles, Tailwind CSS utilities, and custom fairy-themed CSS
- **Backend**: Supabase for authentication and data storage
- **State Management**: React Context for auth and theme management

### Project Structure

```
src/
├── components/           # Main React components
│   ├── ui/              # Reusable UI components (Radix-based)
│   ├── figma/           # Figma-specific components
│   ├── AuthProvider.tsx # Authentication context
│   ├── ThemeProvider.tsx # Theme management
│   ├── Dashboard.tsx    # Main user dashboard
│   ├── BookFairyLanding.tsx # Landing page
│   ├── OnboardingFlow.tsx # User onboarding
│   └── FloatingBookFairy.tsx # Persistent UI element
├── utils/
│   └── supabase/        # Supabase client utilities
├── styles/              # CSS files
│   ├── bookfairy.css   # Fairy-themed styles
│   ├── globals.css     # Global styles
│   └── index.css       # Main CSS entry
├── assets/             # Static assets (images)
└── supabase/          # Supabase backend functions
```

### Application Flow
1. **Landing Page** (`BookFairyLanding`) - Entry point for unauthenticated users
2. **Authentication** - Google OAuth integration via `GoogleOAuthPage`
3. **Onboarding** - New user setup flow that triggers every 60 days
4. **Dashboard** - Main authenticated user interface
5. **Floating Fairy** - Persistent UI element present on all pages

### Key Features
- **Authentication**: Google OAuth via Supabase Auth
- **Onboarding**: Periodic user onboarding (every 60 days) with localStorage tracking
- **Book Management**: Search, view, and manage books (components: `SearchBooks`, `BookCard`, `BookDetails`)
- **Theme Support**: Light/dark theme switching via `ThemeProvider` and `ThemeToggle`
- **Mobile-First Design**: Responsive design with mobile container class
- **Settings**: User preferences and configuration

### Important Notes
- The app uses extensive Vite alias configuration for package resolution
- Custom CSS animations and fairy-themed styling in `bookfairy.css`
- All major UI components are wrapped in providers (Auth, Theme)
- Figma assets are integrated directly via custom asset resolution
- Supabase is used for both authentication and backend services
- The floating fairy component appears on every page for consistent UX