# Tasks: BookFairy – Mobile-First Audiobook Fairy WebApp

**Input**: Design documents from `C:\Users\TopherTek\Downloads\BookFairy WebApp Development\specs\001-project-title-bookfairy\`
**Prerequisites**: plan.md, research.md, data-model.md, contracts/, quickstart.md

## Format: `[ID] [P?] Description`
- **[P]**: Can run in parallel (different files, no dependencies)
- Include exact file paths in descriptions

## Path Conventions
- **Web app structure**: `src/` at repository root
- React components in `src/components/`
- Tests in `tests/` directory structure

## Phase 3.1: Setup
- [x] T001 Create React project structure with TypeScript and Vite configuration
- [x] T002 Initialize package.json with dependencies: React 18.2+, TypeScript 5.0+, Vite 6.3.5, Radix UI, Supabase, Framer Motion
- [x] T003 [P] Configure ESLint, Prettier, and TypeScript strict mode
- [x] T004 [P] Setup Vitest for unit testing with React Testing Library
- [x] T005 [P] Configure Playwright for E2E testing
- [x] T006 [P] Setup PWA configuration with Vite PWA plugin and Workbox
- [x] T007 [P] Configure Supabase client and environment variables

## Phase 3.2: Tests First (TDD) ⚠️ MUST COMPLETE BEFORE 3.3
**CRITICAL: These tests MUST be written and MUST FAIL before ANY implementation**

### Contract Tests
- [ ] T008 [P] Contract test AUTH endpoints in tests/contract/auth.test.ts
- [ ] T009 [P] Contract test DISCOVERY endpoints in tests/contract/discovery.test.ts
- [ ] T010 [P] Contract test LIBRARY endpoints in tests/contract/library.test.ts

### Core Component Tests
- [ ] T011 [P] Test FairyCharacter animation states in tests/unit/components/BookFairy/FairyCharacter.test.tsx
- [ ] T012 [P] Test TypewriterBubble synchronization in tests/unit/components/BookFairy/TypewriterBubble.test.tsx
- [ ] T013 [P] Test GoogleOAuth flow in tests/unit/components/Auth/GoogleOAuth.test.tsx
- [ ] T014 [P] Test ReadarEngine discovery logic in tests/unit/components/Discovery/ReadarEngine.test.tsx
- [ ] T015 [P] Test WishlistQueue management in tests/unit/components/Library/WishlistQueue.test.tsx

### Integration Tests (User Stories)
- [ ] T016 [P] Integration test first-time user complete flow in tests/integration/first-time-user.test.ts
- [ ] T017 [P] Integration test returning user with valid credentials in tests/integration/returning-user.test.ts
- [ ] T018 [P] Integration test 60-day onboarding renewal in tests/integration/onboarding-renewal.test.ts
- [ ] T019 [P] Integration test fairy character animation cycle in tests/integration/fairy-animation.test.ts
- [ ] T020 [P] Integration test readar discovery system in tests/integration/readar-discovery.test.ts
- [ ] T021 [P] Integration test book discovery and wishlist management in tests/integration/book-wishlist.test.ts
- [ ] T022 [P] Integration test library and notification management in tests/integration/library-notifications.test.ts
- [ ] T023 [P] Integration test theme and accessibility in tests/integration/theme-accessibility.test.ts
- [ ] T024 [P] Integration test error handling and edge cases in tests/integration/error-handling.test.ts
- [ ] T025 [P] Integration test performance and loading in tests/integration/performance.test.ts

### Accessibility Tests
- [ ] T026 [P] Test WCAG compliance in both themes in tests/accessibility/wcag-compliance.test.ts
- [ ] T027 [P] Test keyboard navigation throughout app in tests/accessibility/keyboard-navigation.test.ts
- [ ] T028 [P] Test screen reader compatibility in tests/accessibility/screen-reader.test.ts
- [ ] T029 [P] Test animation degradation for prefers-reduced-motion in tests/accessibility/animation-degradation.test.ts

## Phase 3.3: Core Implementation (ONLY after tests are failing)

### Entity Models and Types
- [ ] T030 [P] Create User entity interface and validation in src/types/User.ts
- [ ] T031 [P] Create Book entity interface and validation in src/types/Book.ts
- [ ] T032 [P] Create WishlistItem entity interface in src/types/WishlistItem.ts
- [ ] T033 [P] Create LibraryItem entity interface in src/types/LibraryItem.ts
- [ ] T034 [P] Create Notification entity interface in src/types/Notification.ts
- [ ] T035 [P] Create ThemePreference entity interface in src/types/ThemePreference.ts
- [ ] T036 [P] Create OnboardingState entity interface in src/types/OnboardingState.ts
- [ ] T037 [P] Create FairyState entity interface in src/types/FairyState.ts
- [ ] T038 [P] Create DiscoveryProfile entity interface in src/types/DiscoveryProfile.ts
- [ ] T039 [P] Create AccessibilitySettings entity interface in src/types/AccessibilitySettings.ts

### Core Services and API Integration
- [ ] T040 [P] Implement Supabase auth service in src/services/supabase/auth.ts
- [ ] T041 [P] Implement Hardcover API service in src/services/hardcover/api.ts
- [ ] T042 [P] Implement Audiobookshelf API service in src/services/audiobookshelf/api.ts
- [ ] T043 [P] Implement web push notifications service in src/services/notifications/push.ts
- [ ] T044 Create database schema and migrations for Supabase in src/services/supabase/schema.sql

### React Hooks and State Management
- [ ] T045 [P] Implement useAuth hook with Google OAuth in src/hooks/useAuth.ts
- [ ] T046 [P] Implement useFairyState hook for animation management in src/hooks/useFairyState.ts
- [ ] T047 [P] Implement useTheme hook with system detection in src/hooks/useTheme.ts
- [ ] T048 [P] Implement useReadar hook for discovery engine in src/hooks/useReadar.ts
- [ ] T049 [P] Implement useAccessibility hook for preferences in src/hooks/useAccessibility.ts
- [ ] T050 [P] Implement useWishlist hook for queue management in src/hooks/useWishlist.ts
- [ ] T051 [P] Implement useLibrary hook for book tracking in src/hooks/useLibrary.ts

### Fairy Character System
- [ ] T052 Implement FairyCharacter main component with Framer Motion in src/components/BookFairy/FairyCharacter.tsx
- [ ] T053 Implement TypewriterBubble with synchronization in src/components/BookFairy/TypewriterBubble.tsx
- [ ] T054 [P] Implement FairyState context provider in src/components/BookFairy/FairyStateProvider.tsx
- [ ] T055 [P] Implement fairy animation definitions in src/components/BookFairy/FairyAnimations.tsx
- [ ] T056 [P] Create fairy personality messages utility in src/utils/fairy-messages.ts

### Authentication Components
- [ ] T057 [P] Implement GoogleOAuth component in src/components/Auth/GoogleOAuth.tsx
- [ ] T058 [P] Implement AuthProvider context in src/components/Auth/AuthProvider.tsx
- [ ] T059 [P] Implement AuthGuard for route protection in src/components/Auth/AuthGuard.tsx

### Core UI Components
- [ ] T060 [P] Implement Dashboard main layout in src/components/Dashboard/Dashboard.tsx
- [ ] T061 [P] Implement Navigation component in src/components/Dashboard/Navigation.tsx
- [ ] T062 [P] Implement WelcomePanel with user greeting in src/components/Dashboard/WelcomePanel.tsx

### Discovery System (Readar)
- [ ] T063 Implement ReadarEngine main component in src/components/Discovery/ReadarEngine.tsx
- [ ] T064 [P] Implement RadarScanning visual metaphors in src/components/Discovery/RadarScanning.tsx
- [ ] T065 [P] Implement BookRecommendations display in src/components/Discovery/BookRecommendations.tsx
- [ ] T066 [P] Implement SearchInterface for traditional search in src/components/Discovery/SearchInterface.tsx

### Library Management
- [ ] T067 [P] Implement LibraryView component in src/components/Library/LibraryView.tsx
- [ ] T068 Implement WishlistQueue with auto-promotion in src/components/Library/WishlistQueue.tsx
- [ ] T069 [P] Implement BookCard display component in src/components/Library/BookCard.tsx
- [ ] T070 [P] Implement BookDetails modal component in src/components/Library/BookDetails.tsx

### Onboarding Flow
- [ ] T071 Implement OnboardingFlow main logic in src/components/Onboarding/OnboardingFlow.tsx
- [ ] T072 [P] Implement PWAInstaller with browser guidance in src/components/Onboarding/PWAInstaller.tsx
- [ ] T073 [P] Implement NotificationSetup component in src/components/Onboarding/NotificationSetup.tsx
- [ ] T074 [P] Implement OnboardingQuiz pre-acceptance in src/components/Onboarding/OnboardingQuiz.tsx

### Theme and Accessibility
- [ ] T075 [P] Implement ThemeProvider with CSS custom properties in src/components/ThemeProvider.tsx
- [ ] T076 [P] Create theme CSS definitions in src/styles/themes.css
- [ ] T077 [P] Implement accessibility utilities in src/utils/accessibility.ts
- [ ] T078 [P] Create animation keyframes and transitions in src/styles/animations.css

### Page Components
- [ ] T079 [P] Implement LandingPage for unauthenticated users in src/pages/LandingPage.tsx
- [ ] T080 [P] Implement DashboardPage main authenticated view in src/pages/DashboardPage.tsx
- [ ] T081 [P] Implement LibraryPage for book management in src/pages/LibraryPage.tsx
- [ ] T082 [P] Implement DiscoveryPage for book discovery in src/pages/DiscoveryPage.tsx
- [ ] T083 [P] Implement SettingsPage for user preferences in src/pages/SettingsPage.tsx

## Phase 3.4: Integration
- [ ] T084 Connect authentication flow with Supabase backend
- [ ] T085 Integrate Hardcover API with discovery system
- [ ] T086 Connect Audiobookshelf API for account management
- [ ] T087 Setup web push notification service worker
- [ ] T088 Integrate fairy state with typewriter synchronization
- [ ] T089 Connect wishlist queue with auto-promotion logic
- [ ] T090 Setup PWA manifest and service worker caching
- [ ] T091 Integrate accessibility settings with component behavior
- [ ] T092 Connect theme switching with localStorage persistence
- [ ] T093 Setup error boundaries with fairy error messages

## Phase 3.5: Polish
- [ ] T094 [P] Add unit tests for utility functions in tests/unit/utils/
- [ ] T095 [P] Performance optimization for fairy animations (<200ms, 60fps)
- [ ] T096 [P] Accessibility audit with axe-core automation
- [ ] T097 [P] Cross-browser testing (Chrome, Safari, Firefox, Edge)
- [ ] T098 [P] Mobile responsiveness testing (320px minimum width)
- [ ] T099 [P] PWA functionality testing (offline, installation)
- [ ] T100 [P] Load time optimization (<2s initial load)
- [ ] T101 [P] Theme switching performance (<300ms)
- [ ] T102 Run complete quickstart manual testing scenarios
- [ ] T103 Constitutional compliance validation checklist
- [ ] T104 [P] Error handling edge case testing
- [ ] T105 [P] Notification system end-to-end testing

## Dependencies
- **Setup (T001-T007)** before all other phases
- **Tests (T008-T029)** before implementation (T030-T083)
- **Entity types (T030-T039)** before services and components
- **Services (T040-T044)** before hooks and components
- **Hooks (T045-T051)** before components that use them
- **Core components** before page components
- **Integration (T084-T093)** before polish
- **Polish (T094-T105)** after all implementation complete

## Parallel Execution Examples

### Setup Phase (can run in parallel)
```
Task: "Configure ESLint, Prettier, and TypeScript strict mode"
Task: "Setup Vitest for unit testing with React Testing Library"
Task: "Configure Playwright for E2E testing"
Task: "Setup PWA configuration with Vite PWA plugin and Workbox"
Task: "Configure Supabase client and environment variables"
```

### Contract Tests (can run in parallel)
```
Task: "Contract test AUTH endpoints in tests/contract/auth.test.ts"
Task: "Contract test DISCOVERY endpoints in tests/contract/discovery.test.ts"
Task: "Contract test LIBRARY endpoints in tests/contract/library.test.ts"
```

### Entity Models (can run in parallel)
```
Task: "Create User entity interface and validation in src/types/User.ts"
Task: "Create Book entity interface and validation in src/types/Book.ts"
Task: "Create WishlistItem entity interface in src/types/WishlistItem.ts"
Task: "Create LibraryItem entity interface in src/types/LibraryItem.ts"
Task: "Create Notification entity interface in src/types/Notification.ts"
```

### Core Services (can run in parallel)
```
Task: "Implement Supabase auth service in src/services/supabase/auth.ts"
Task: "Implement Hardcover API service in src/services/hardcover/api.ts"
Task: "Implement Audiobookshelf API service in src/services/audiobookshelf/api.ts"
Task: "Implement web push notifications service in src/services/notifications/push.ts"
```

## Notes
- [P] tasks = different files, no dependencies
- Verify tests fail before implementing
- Follow constitutional principles throughout
- Maintain WCAG 2.1 AA compliance
- Ensure fairy character behavior synchronization
- Test accessibility with screen readers
- Validate performance targets at each phase

## Task Generation Rules Applied
1. **From Contracts**: 3 contract files → 3 contract test tasks [P]
2. **From Data Model**: 10 entities → 10 model creation tasks [P]
3. **From User Stories**: 10 scenarios → 10 integration test tasks [P]
4. **From Components**: ~15 components → individual implementation tasks
5. **From Quickstart**: 10 test scenarios → corresponding test tasks

## Validation Checklist
- [x] All contracts have corresponding tests (T008-T010)
- [x] All entities have model tasks (T030-T039)
- [x] All tests come before implementation (Phase 3.2 before 3.3)
- [x] Parallel tasks truly independent (different files)
- [x] Each task specifies exact file path
- [x] No task modifies same file as another [P] task
- [x] Constitutional compliance embedded throughout
- [x] Accessibility requirements integrated
- [x] Performance targets included in polish phase