# Feature Specification: BookFairy – Mobile-First Audiobook Fairy WebApp

**Feature Branch**: `001-project-title-bookfairy`
**Created**: 2025-09-21
**Status**: Draft
**Input**: User description: "Project Title: BookFairy – Mobile-First Audiobook Fairy WebApp

Description:
Create a mobile-friendly, PWA-ready website called BookFairy. The site will be hosted on Cloudflare Pages with backend APIs exposed through Cloudflare Tunnel. It replaces Discord as the main interface for audiobook requests, downloads, and recommendations. The BookFairy persona (Southern, sexy, playful PG-13, whimsical fairy) is the face and voice of the system, guiding users through setup, actions, and notifications."

---

## User Scenarios & Testing

### Primary User Story
A user wants to discover, request, and manage audiobooks through a magical, personality-driven web application. They authenticate with Google, provide their Hardcover API key, complete a mandatory PWA setup process guided by the BookFairy character, and then access a dashboard where the fairy acts as an intelligent discovery engine using radar-like scanning metaphors to surface books with minimal user effort. The fairy character follows a precise animation cycle synchronized with message delivery.

### Acceptance Scenarios
1. **Given** a first-time user visits BookFairy, **When** they complete Google OAuth login, **Then** they are immediately prompted to provide their Hardcover API key and guided through PWA installation and notification setup before accessing the dashboard.

2. **Given** a returning user with valid credentials, **When** they log in, **Then** they either proceed directly to dashboard or complete a 60-day onboarding renewal flow.

3. **Given** a user on the dashboard, **When** they search for audiobooks by author, title, or browse by genre, **Then** they see book cards with cover, title, author, narrators, and synopsis with Download and View Details options.

4. **Given** a user finds a book they want, **When** they add it to their wishlist, **Then** it acts as a queue and auto-promotes when download slots become available.

5. **Given** an audiobook download completes, **When** the system processes it, **Then** the user receives a push notification in BookFairy's Southern voice and the book appears in their library.

6. **Given** a user is using the app, **When** the fairy character appears on screen, **Then** it follows the complete animation cycle: flying randomly (5-12 second intervals) → landing at center-above position before new messages → staying perched during typing → taking off after message completion.

7. **Given** a user accesses the dashboard with minimal input, **When** the "readar" discovery system activates, **Then** BookFairy automatically surfaces book recommendations and suggestions using radar-like scanning metaphors without requiring explicit searches.

8. **Given** a user has accessibility preferences enabled, **When** prefers-reduced-motion is detected, **Then** the fairy teleports instantly to typing position instead of animating flight paths.

9. **Given** OAuth authentication fails, **When** the error occurs, **Then** the fairy delivers a sass message in character while providing clear retry options.

10. **Given** the fairy is about to deliver a new message, **When** the animation cycle begins, **Then** typewriter text ONLY begins after the fairy has completed landing and is perched above the speech bubble.

### Edge Cases
- What happens when a user denies PWA installation or push notifications? (Fairy sass response, must retry until granted)
- How does the system handle expired wishlist requests? (30-day expiration with Retry option)
- What occurs when Hardcover API key becomes invalid? (Re-prompt user for valid key)
- How does the app behave on unsupported browsers? (Fairy guides user to supported browser)
- What happens when prefers-reduced-motion is enabled? (Fairy teleports to positions instead of smooth animations)
- How does the readar system behave with no user preferences? (Uses general popularity and trending data for discovery)
- What occurs during fairy animation state conflicts? (Current message completes before new animation cycle begins)

### Fairy Character Animation Test Cases
1. **Motion Disabled Test**: **Given** prefers-reduced-motion is enabled, **When** fairy needs to deliver a message, **Then** fairy teleports instantly to center-above position without flight animation.

2. **Normal Cycle Test**: **Given** normal motion preferences, **When** fairy delivers a message, **Then** complete cycle executes: flying → landing (smooth animation) → typing (perched) → takeoff (smooth animation).

3. **Typewriter Sync Test**: **Given** fairy is in flying state, **When** new message is triggered, **Then** typewriter text does NOT begin until fairy has completed landing animation and is in typing state.

4. **Flight Interval Test**: **Given** fairy is in flying state, **When** no new messages are pending, **Then** fairy continues random flight patterns with intervals between 5-12 seconds.

5. **Position Accuracy Test**: **Given** fairy needs to deliver a message, **When** landing animation executes, **Then** fairy MUST arrive at center-above position relative to speech bubble consistently.

### Discovery Layer (Readar) Test Cases
1. **Passive Discovery Test**: **Given** user accesses dashboard without searching, **When** readar system activates, **Then** system presents curated book suggestions using radar-scanning visual metaphors.

2. **Effortless Suggestions Test**: **Given** user has minimal interaction history, **When** they view recommendations, **Then** system provides suggestions based on trending and popularity data without requiring user input.

3. **Automatic Curation Test**: **Given** user has established preferences, **When** they access the discovery section, **Then** system automatically curates personalized recommendations without manual query building.

### Accessibility Test Cases
1. **Contrast Compliance Test**: **Given** both day and night themes, **When** measured for contrast ratios, **Then** all text meets WCAG 4.5:1 minimum for normal text and 3:1 for large text.

2. **Keyboard Navigation Test**: **Given** user navigates via keyboard only, **When** they tab through interface, **Then** all interactive elements are reachable with visible focus indicators.

3. **Aria-Label Test**: **Given** screen reader user, **When** they navigate the interface, **Then** all interactive elements provide clear, descriptive aria-labels.

4. **Animation Degradation Test**: **Given** prefers-reduced-motion setting, **When** any animations are triggered, **Then** they degrade gracefully to instant state changes while preserving functionality.

## Requirements

### Functional Requirements

#### Core Authentication & Setup
- **FR-001**: System MUST authenticate users via Google OAuth integration
- **FR-002**: System MUST require and validate Hardcover API key from all users before dashboard access
- **FR-003**: System MUST auto-create Audiobookshelf accounts for new users
- **FR-004**: System MUST enforce mandatory PWA installation and push notification acceptance through guided onboarding
- **FR-005**: System MUST enforce onboarding renewal every 60 days before dashboard access

#### Discovery & Search (Readar System)
- **FR-006**: System MUST provide dashboard with search by author, title, genre browsing, and recommendation features
- **FR-007**: System MUST implement "readar" discovery engine that acts as intelligent book surfacing system, not just search interface
- **FR-008**: System MUST provide radar-like scanning metaphor for book discovery with visual indicators
- **FR-009**: System MUST deliver effortless book suggestions with minimal user input required
- **FR-010**: System MUST implement automatic curation that presents recommendations without manual query building
- **FR-011**: System MUST display book information cards with cover, title, author, narrators, and synopsis (≤500 chars)

#### Library & Wishlist Management
- **FR-012**: System MUST implement wishlist functionality that acts as a queue with auto-promotion when slots are available
- **FR-013**: System MUST track user's downloaded books in a library for recommendation purposes (no playback)
- **FR-014**: System MUST flag expired wishlist requests (30 days) with retry options
- **FR-015**: System MUST send web push notifications for download completions, wishlist promotions, and new author discoveries
- **FR-016**: System MUST synchronize notifications with Audiobookshelf system

#### Theme & Interface
- **FR-017**: System MUST implement day/night theme modes with automatic system detection and manual toggle
- **FR-018**: System MUST provide mobile-first, responsive design with large tappable buttons
- **FR-019**: System MUST implement PWA capabilities with splash screen and home screen icon
- **FR-020**: System MUST provide browser-specific installation guidance (Chrome/Edge for PC, Chrome for Android, Safari for iOS)

#### Fairy Character Behavior
- **FR-021**: System MUST present BookFairy character with Southern, playful, PG-13 personality through speech bubbles and notifications
- **FR-022**: System MUST implement fairy character animation states following precise cycle: flying → landing → typing → takeoff
- **FR-023**: System MUST ensure typewriter text begins ONLY when fairy is in typing state (perched above speech bubble)
- **FR-024**: System MUST position fairy at center-above location before any new message delivery
- **FR-025**: System MUST randomize fairy flight intervals between 5-12 seconds when in flying state
- **FR-026**: System MUST implement smooth, whimsical animations for fairy movement respecting prefers-reduced-motion
- **FR-027**: System MUST provide fairy teleport mode when prefers-reduced-motion is enabled
- **FR-028**: System MUST implement pre-acceptance quiz during onboarding to ensure user understanding

#### Accessibility Requirements
- **FR-029**: System MUST maintain WCAG contrast compliance (4.5:1 normal text, 3:1 large text) in both themes
- **FR-030**: System MUST provide full keyboard navigation support with visible focus indicators
- **FR-031**: System MUST implement comprehensive aria-labels for all interactive elements
- **FR-032**: System MUST respect prefers-reduced-motion accessibility settings for all animations
- **FR-033**: System MUST ensure all fairy animations degrade gracefully to preserve functionality for motion-sensitive users

### Key Entities
- **User**: Authentication state, Hardcover API key, Audiobookshelf account, onboarding completion status, last renewal date, accessibility preferences
- **Book**: Cover image, title, author, narrators, synopsis, genre, availability status, download status, discovery score
- **Wishlist Item**: Book reference, request date, expiration status, queue position
- **Library Item**: Book reference, download completion date, user rating/notes for recommendations
- **Notification**: Type (download complete, wishlist promotion, new author), message content, delivery timestamp, read status
- **Theme Preference**: Day/night mode selection, system auto-detection setting
- **Onboarding State**: PWA installation status, push notification permission, quiz completion, renewal due date
- **Fairy State**: Current animation state (flying/landing/typing/takeoff), position coordinates, message queue, accessibility mode
- **Discovery Profile**: User preferences, reading history, recommendation weights, readar scanning preferences
- **Accessibility Settings**: Motion preference, contrast requirements, keyboard navigation mode, screen reader compatibility

---

## Review & Acceptance Checklist

### Content Quality
- [x] No implementation details (languages, frameworks, APIs)
- [x] Focused on user value and business needs
- [x] Written for non-technical stakeholders
- [x] All mandatory sections completed

### Requirement Completeness
- [x] No [NEEDS CLARIFICATION] markers remain
- [x] Requirements are testable and unambiguous
- [x] Success criteria are measurable
- [x] Scope is clearly bounded
- [x] Dependencies and assumptions identified

### Fairy Character Specification
- [x] Animation state cycle clearly defined (flying → landing → typing → takeoff)
- [x] Typewriter synchronization rules specified
- [x] Positioning requirements explicit (center-above)
- [x] Flight interval timing defined (5-12 seconds)
- [x] Accessibility degradation specified (teleport mode)
- [x] Test cases comprehensive for all animation states

### Discovery Layer (Readar) Specification
- [x] Discovery engine concept clearly articulated
- [x] Radar metaphor requirements defined
- [x] Effortless suggestion behavior specified
- [x] Automatic curation requirements explicit
- [x] Test cases cover passive discovery scenarios

### Accessibility Specification
- [x] WCAG contrast requirements explicit for both themes
- [x] Keyboard navigation requirements comprehensive
- [x] Aria-label requirements specified
- [x] Animation degradation requirements clear
- [x] Test cases cover all accessibility scenarios

---

## Execution Status

- [x] User description parsed
- [x] Key concepts extracted
- [x] Ambiguities marked
- [x] User scenarios defined
- [x] Requirements generated
- [x] Entities identified
- [x] Fairy character behavior integrated
- [x] Discovery layer (Readar) concepts added
- [x] Accessibility guardrails enhanced
- [x] Comprehensive test cases defined
- [x] Review checklist passed