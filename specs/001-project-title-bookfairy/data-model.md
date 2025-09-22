# Data Model: BookFairy Entities and Relationships

## Core Entities

### User
**Purpose**: Represents authenticated users with their preferences and state
```typescript
interface User {
  id: string                    // UUID primary key
  email: string                 // From Google OAuth
  name: string                  // Display name from OAuth
  avatar_url?: string           // Profile picture URL
  hardcover_api_key: string     // Required for book discovery
  audiobookshelf_account_id: string // Auto-created account reference
  created_at: timestamp
  updated_at: timestamp

  // Onboarding & Renewal
  onboarding_completed: boolean
  last_onboarding_date: timestamp
  next_renewal_date: timestamp  // Every 60 days

  // Accessibility Preferences
  prefers_reduced_motion: boolean
  high_contrast_mode: boolean
  keyboard_navigation: boolean
  screen_reader_mode: boolean
}
```

**Relationships**:
- One-to-many with Library Items
- One-to-many with Wishlist Items
- One-to-one with Theme Preferences
- One-to-one with Discovery Profile
- One-to-many with Notifications

**Validation Rules**:
- Email must be valid format
- Hardcover API key required before dashboard access
- Onboarding renewal every 60 days

### Book
**Purpose**: Book metadata retrieved from Hardcover API with discovery scoring
```typescript
interface Book {
  id: string                    // UUID primary key
  hardcover_id: string          // External API reference
  title: string
  author: string
  narrator?: string
  isbn?: string
  cover_image_url: string
  synopsis: string              // Max 500 characters
  genre: string[]
  publication_date?: date
  duration_minutes?: number

  // Discovery & Recommendation
  discovery_score: number       // 0-100 for readar ranking
  popularity_score: number      // Trending calculation
  last_updated: timestamp

  // Availability
  availability_status: 'available' | 'processing' | 'unavailable'
  download_url?: string         // When available
}
```

**Relationships**:
- Many-to-many with Library Items (through users)
- Many-to-many with Wishlist Items (through users)

**Validation Rules**:
- Title and author required
- Synopsis max 500 characters
- Cover image URL must be valid

### Wishlist Item
**Purpose**: User's queued book requests with auto-promotion logic
```typescript
interface WishlistItem {
  id: string                    // UUID primary key
  user_id: string               // Foreign key to User
  book_id: string               // Foreign key to Book
  requested_date: timestamp
  priority: number              // Queue position
  status: 'pending' | 'processing' | 'expired' | 'fulfilled'
  expiration_date: timestamp    // 30 days from request

  // Auto-promotion tracking
  last_check_date: timestamp
  promotion_attempts: number
}
```

**Relationships**:
- Many-to-one with User
- Many-to-one with Book

**Business Rules**:
- Auto-promote when slots available
- 30-day expiration with retry option
- Queue ordering by priority and date

### Library Item
**Purpose**: User's downloaded/completed books for recommendations
```typescript
interface LibraryItem {
  id: string                    // UUID primary key
  user_id: string               // Foreign key to User
  book_id: string               // Foreign key to Book
  added_date: timestamp
  download_completed_date: timestamp

  // User feedback for recommendations
  user_rating?: number          // 1-5 stars
  user_notes?: string           // Personal notes
  completion_status: 'downloaded' | 'started' | 'completed' | 'archived'

  // Recommendation data
  recommendation_weight: number // Used by discovery engine
}
```

**Relationships**:
- Many-to-one with User
- Many-to-one with Book

**Business Rules**:
- No playback functionality (library only)
- Used for recommendation algorithm
- Tracks completion for discovery improvements

### Notification
**Purpose**: Push notifications and in-app messaging system
```typescript
interface Notification {
  id: string                    // UUID primary key
  user_id: string               // Foreign key to User
  type: 'download_complete' | 'wishlist_promotion' | 'new_author' | 'system'
  title: string
  message: string               // In BookFairy's voice
  delivery_timestamp: timestamp
  read_status: boolean

  // Push notification data
  push_sent: boolean
  push_subscription_used?: string

  // Related entities
  related_book_id?: string      // For book-specific notifications
  related_wishlist_item_id?: string
}
```

**Relationships**:
- Many-to-one with User
- Optional reference to Book or Wishlist Item

**Business Rules**:
- Sync with Audiobookshelf notifications
- Fairy personality in message content
- Web push integration

### Theme Preference
**Purpose**: User's visual theme settings and preferences
```typescript
interface ThemePreference {
  user_id: string               // Primary key, foreign key to User
  theme_mode: 'light' | 'dark' | 'system'
  custom_theme?: string         // Future extensibility

  // Theme timing
  auto_switch_enabled: boolean
  last_updated: timestamp
}
```

**Relationships**:
- One-to-one with User

**Business Rules**:
- System auto-detection as default
- Manual override capability
- Smooth theme transitions

### Onboarding State
**Purpose**: Tracks PWA installation and notification setup progress
```typescript
interface OnboardingState {
  user_id: string               // Primary key, foreign key to User
  pwa_installed: boolean
  push_notifications_enabled: boolean
  quiz_completed: boolean
  quiz_attempts: number

  // Browser compatibility
  browser_type: string          // Chrome, Safari, Firefox, Edge
  installation_method?: string  // Platform-specific guidance used

  // Renewal tracking
  renewal_due_date: timestamp
  last_completed: timestamp
}
```

**Relationships**:
- One-to-one with User

**Business Rules**:
- Mandatory completion before dashboard access
- Renewal every 60 days
- Browser-specific guidance

### Fairy State
**Purpose**: Real-time fairy character animation and behavior state
```typescript
interface FairyState {
  user_id: string               // Primary key, foreign key to User
  current_state: 'flying' | 'landing' | 'typing' | 'takeoff'
  position_x: number            // Screen coordinates
  position_y: number

  // Message queue
  pending_messages: string[]    // Queued typewriter messages
  current_message?: string      // Currently typing

  // Animation preferences
  accessibility_mode: boolean   // Teleport vs. animate
  last_flight_time: timestamp
  flight_interval_seconds: number // 5-12 random range
}
```

**Relationships**:
- One-to-one with User

**Business Rules**:
- Synchronized with typewriter animation
- Accessibility mode for reduced motion
- Center-above positioning for message delivery

### Discovery Profile
**Purpose**: User's reading preferences and recommendation algorithm data
```typescript
interface DiscoveryProfile {
  user_id: string               // Primary key, foreign key to User

  // Preference tracking
  favorite_genres: string[]
  favorite_authors: string[]
  preferred_narrators: string[]

  // Behavior analysis
  search_history: object[]      // Recent searches
  click_patterns: object[]      // Interaction data
  recommendation_feedback: object[] // Liked/disliked suggestions

  // Readar settings
  discovery_sensitivity: number // How aggressive readar suggestions are
  auto_curation_enabled: boolean
  passive_discovery_enabled: boolean

  last_updated: timestamp
}
```

**Relationships**:
- One-to-one with User

**Business Rules**:
- Powers readar discovery engine
- Privacy-respecting data collection
- User control over suggestion aggressiveness

### Accessibility Settings
**Purpose**: Comprehensive accessibility preferences and overrides
```typescript
interface AccessibilitySettings {
  user_id: string               // Primary key, foreign key to User

  // Motion preferences
  prefers_reduced_motion: boolean
  animation_duration_multiplier: number // 0.1 to 2.0

  // Visual preferences
  high_contrast_enabled: boolean
  custom_contrast_ratio?: number
  font_size_multiplier: number  // 0.8 to 2.0

  // Navigation preferences
  keyboard_navigation_enabled: boolean
  screen_reader_optimized: boolean
  focus_indicator_enhanced: boolean

  // Audio preferences
  notification_sound_enabled: boolean
  sound_volume_level: number    // 0-100

  last_updated: timestamp
}
```

**Relationships**:
- One-to-one with User

**Business Rules**:
- Overrides system preferences when specified
- Affects fairy animation behavior
- Impacts UI component rendering

## Entity Relationships Diagram

```
User (1) ──────────── (1) Theme Preference
  │
  ├── (1) ──────────── (1) Onboarding State
  │
  ├── (1) ──────────── (1) Fairy State
  │
  ├── (1) ──────────── (1) Discovery Profile
  │
  ├── (1) ──────────── (1) Accessibility Settings
  │
  ├── (1) ──────────── (*) Library Item
  │
  ├── (1) ──────────── (*) Wishlist Item
  │
  └── (1) ──────────── (*) Notification

Book (*) ──────────── (*) Library Item
  │
  └── (*) ──────────── (*) Wishlist Item
```

## State Transitions

### Wishlist Item States
- `pending` → `processing` (when auto-promoted)
- `pending` → `expired` (after 30 days)
- `processing` → `fulfilled` (when download completes)
- `expired` → `pending` (when user retries)

### Fairy Animation States
- `flying` → `landing` (when message queued)
- `landing` → `typing` (when positioned above bubble)
- `typing` → `takeoff` (when message complete)
- `takeoff` → `flying` (return to idle state)

### Library Item States
- `downloaded` → `started` (user begins listening)
- `started` → `completed` (user finishes)
- `completed` → `archived` (user moves to archive)

## Data Validation Rules

1. **User Validation**:
   - Email format validation
   - Hardcover API key required for dashboard access
   - Onboarding must be completed within 24 hours

2. **Book Validation**:
   - Synopsis limited to 500 characters
   - Cover image URL must be accessible
   - Genre must be from predefined list

3. **Notification Validation**:
   - Message content must follow fairy personality guidelines
   - Push notifications respect user preferences
   - Related entity references must be valid

4. **Accessibility Validation**:
   - Animation multipliers within 0.1-2.0 range
   - Font size multipliers within 0.8-2.0 range
   - Contrast ratios meet WCAG requirements