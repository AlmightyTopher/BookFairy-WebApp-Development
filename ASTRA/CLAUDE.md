# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

BookFairy is a React web application built with Vite that replaces Discord as the interface for audiobook requests, downloads, and recommendations. The app features a magical fairy character with a Southern personality, implements a "readar" discovery system, and enforces constitutional principles for user experience.

## Development Commands

- `npm run dev` - Start development server (runs on port 3000 with auto-open)
- `npm run build` - Build for production (outputs to `build/` directory)
- `npm run test` - Run unit tests with Vitest
- `npm run test:e2e` - Run end-to-end tests with Playwright
- `npm run lint` - Run ESLint checks
- `npm run typecheck` - Run TypeScript type checking
- `npm i` - Install dependencies

## Architecture & Key Components

### Tech Stack
- **Framework**: React 18 with TypeScript 5.0+
- **Build Tool**: Vite 6.3.5 with SWC for fast compilation
- **UI Library**: Radix UI components for accessibility
- **Animations**: Framer Motion for fairy character animations
- **Styling**: CSS with custom properties for themes, Tailwind CSS utilities
- **Backend**: Supabase for authentication and data storage
- **State Management**: React Context for auth, theme, and fairy state management
- **PWA**: Vite PWA plugin with Workbox for service worker

### Project Structure

```
src/
├── components/           # Main React components
│   ├── ui/              # Reusable UI components (Radix-based)
│   ├── figma/           # Figma-specific design components
│   ├── BookFairy/       # Fairy character components
│   │   ├── FairyCharacter.tsx    # Main fairy animation component
│   │   ├── TypewriterBubble.tsx  # Speech bubble with typewriter effect
│   │   ├── FairyState.tsx        # State management for fairy behavior
│   │   └── FairyAnimations.tsx   # Animation definitions and accessibility
│   ├── Auth/            # Authentication components
│   │   ├── GoogleOAuth.tsx       # Google OAuth integration
│   │   ├── AuthProvider.tsx      # Authentication context
│   │   └── AuthGuard.tsx         # Route protection
│   ├── Dashboard/       # Main user dashboard
│   │   ├── Dashboard.tsx         # Main dashboard layout
│   │   ├── Navigation.tsx        # App navigation
│   │   └── WelcomePanel.tsx      # User greeting and status
│   ├── Discovery/       # Readar discovery system
│   │   ├── ReadarEngine.tsx      # Main discovery interface
│   │   ├── RadarScanning.tsx     # Visual radar metaphors
│   │   ├── BookRecommendations.tsx # Recommendation display
│   │   └── SearchInterface.tsx   # Traditional search
│   ├── Library/         # Library and wishlist management
│   │   ├── LibraryView.tsx       # User's book library
│   │   ├── WishlistQueue.tsx     # Wishlist with queue management
│   │   ├── BookCard.tsx          # Book display component
│   │   └── BookDetails.tsx       # Detailed book view
│   ├── Onboarding/      # PWA onboarding flow
│   │   ├── OnboardingFlow.tsx    # Main onboarding logic
│   │   ├── PWAInstaller.tsx      # PWA installation guidance
│   │   ├── NotificationSetup.tsx # Push notification setup
│   │   └── OnboardingQuiz.tsx    # Pre-acceptance quiz
│   └── ThemeProvider.tsx # Theme management and switching
├── pages/               # Route components
│   ├── LandingPage.tsx  # Unauthenticated landing
│   ├── DashboardPage.tsx # Main authenticated view
│   ├── LibraryPage.tsx  # Library management
│   ├── DiscoveryPage.tsx # Book discovery
│   └── SettingsPage.tsx # User preferences
├── services/            # API integrations
│   ├── supabase/        # Supabase client and auth
│   ├── hardcover/       # Hardcover API integration
│   ├── audiobookshelf/  # Audiobookshelf API integration
│   └── notifications/   # Web push notifications
├── hooks/               # Custom React hooks
│   ├── useAuth.ts       # Authentication state
│   ├── useFairyState.ts # Fairy animation state
│   ├── useTheme.ts      # Theme management
│   ├── useReadar.ts     # Discovery engine
│   └── useAccessibility.ts # Accessibility preferences
├── utils/               # Utility functions
│   ├── fairy-messages.ts # Fairy personality messages
│   ├── accessibility.ts # Accessibility helpers
│   ├── animations.ts    # Animation utilities
│   └── constants.ts     # App constants
├── styles/              # CSS files
│   ├── globals.css      # Global styles and CSS custom properties
│   ├── themes.css       # Day/night theme definitions
│   ├── animations.css   # Animation keyframes and transitions
│   └── accessibility.css # Accessibility overrides
└── assets/              # Static assets
    ├── images/          # Fairy character images and UI graphics
    ├── icons/           # PWA icons and favicons
    └── sounds/          # Notification sounds (optional)
```

### Application Flow
1. **Landing Page** - Unauthenticated users see fairy character and login prompt
2. **Google OAuth** - Seamless authentication via Supabase Auth
3. **Hardcover API Setup** - Mandatory API key collection
4. **Onboarding Flow** - PWA installation and notification setup with fairy guidance
5. **Dashboard** - Main interface with readar discovery system
6. **Book Discovery** - Search, browse, and passive recommendation via readar
7. **Wishlist Management** - Queue-based book requests with auto-promotion
8. **Library Tracking** - Downloaded books for recommendation algorithm
9. **Notifications** - Web push integration with fairy personality

### Key Features
- **Fairy Character**: Interactive animation states (flying → landing → typing → takeoff)
- **Readar Discovery**: Passive book surfacing with radar-like scanning metaphors
- **Constitutional Compliance**: Enforces all 7 constitutional principles
- **Accessibility**: WCAG 2.1 AA compliance with graceful animation degradation
- **PWA Capabilities**: Installation, offline functionality, push notifications
- **Theme Support**: Day/night modes with system auto-detection
- **Mobile-First Design**: Responsive with ≥44px touch targets

### Important Notes
- Constitutional principles override all other considerations
- Fairy character behavior must be synchronized with typewriter animation
- Accessibility settings affect fairy animation (teleport vs. smooth)
- All UI text should maintain fairy personality (Southern, playful, PG-13)
- Performance targets: <2s load, <300ms theme switch, <200ms fairy animations
- Testing: Unit tests with Vitest, E2E with Playwright, accessibility with axe-core

## Development Guidelines

### Fairy Character Implementation
- Use Framer Motion for animation state management
- Implement state machine: flying → landing → typing → takeoff
- Synchronize with typewriter effect timing
- Provide teleport mode for prefers-reduced-motion
- Center-above positioning for message delivery
- 5-12 second randomized flight intervals

### Accessibility Requirements
- Maintain WCAG 2.1 AA compliance
- Support keyboard navigation throughout
- Provide comprehensive aria-labels
- Respect prefers-reduced-motion for all animations
- Test with screen readers and accessibility tools

### API Integration Patterns
- Use React Query for caching and state management
- Implement error boundaries with fairy error messages
- Handle rate limiting gracefully
- Store sensitive data (API keys) securely in Supabase

### Theme and Styling
- Use CSS custom properties for theme tokens
- Implement smooth transitions between themes
- Maintain visual integrity in both day/night modes
- Mobile-first responsive design principles

### Testing Approach
- Unit tests for all components and hooks
- Integration tests for API services
- E2E tests for critical user flows
- Accessibility testing with automated and manual checks
- Performance testing for animation smoothness

### Constitutional Compliance Checklist
- [ ] Fairy Voice Is Sacred: Continuous rotation, interactive behavior
- [ ] Login Must Be Seamless: Responsive OAuth, clear feedback
- [ ] Accessibility Is Non-Negotiable: WCAG compliance, graceful degradation
- [ ] Consistency Across Themes: Visual integrity maintained
- [ ] Discovery Over Search: Readar system with passive discovery
- [ ] Lazy Librarian Spirit: Effortless suggestions, auto-curation
- [ ] Performance & Immersion: Fast loading, smooth animations

## Recent Changes
- Initial project setup with React 18 and TypeScript
- Constitutional framework established (v1.1.0)
- Comprehensive feature specification completed
- API contracts designed for auth, discovery, and library management
- Data model defined with 10 core entities
- Implementation plan created with Phase 0-1 complete

## Dependencies Management
- Keep dependencies minimal and well-maintained
- Prefer React-native libraries for animations
- Use TypeScript for all new code
- Implement proper error boundaries and loading states
- Follow React best practices for performance and accessibility