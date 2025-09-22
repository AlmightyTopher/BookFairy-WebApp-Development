/**
 * DiscoveryProfile Entity Interface
 *
 * Defines user preferences and discovery patterns for the BookFairy
 * readar system and personalized book recommendations
 */

export interface DiscoveryProfile {
  id: string;
  user_id: string;
  preferred_genres: string[];
  favorite_authors: string[];
  preferred_narrators: string[];
  reading_pace: ReadingPace;
  content_preferences: ContentPreferences;
  discovery_settings: DiscoverySettings;
  reading_history_weight: number;
  trending_influence: number;
  similarity_threshold: number;
  last_updated: string;
  onboarding_responses: OnboardingResponse[];
}

export interface ContentPreferences {
  preferred_duration_range: DurationRange;
  series_preference: SeriesPreference;
  language_preferences: string[];
  content_rating_max: ContentRating;
  avoid_genres: string[];
  avoid_authors: string[];
  avoid_topics: string[];
  preferred_publication_era: PublicationEra;
}

export interface DiscoverySettings {
  discovery_frequency: DiscoveryFrequency;
  scan_intensity: number; // 1-10
  include_trending: boolean;
  include_new_releases: boolean;
  include_classics: boolean;
  author_discovery_enabled: boolean;
  genre_exploration_enabled: boolean;
  similar_books_weight: number;
  serendipity_factor: number; // How much randomness to include
}

export interface OnboardingResponse {
  question_id: string;
  question_text: string;
  response: string | string[] | number;
  response_type: 'single_choice' | 'multiple_choice' | 'text' | 'rating' | 'range';
  timestamp: string;
}

export interface DiscoveryProfileUpdate {
  preferred_genres?: string[];
  favorite_authors?: string[];
  preferred_narrators?: string[];
  reading_pace?: ReadingPace;
  content_preferences?: Partial<ContentPreferences>;
  discovery_settings?: Partial<DiscoverySettings>;
  onboarding_responses?: OnboardingResponse[];
}

export interface DurationRange {
  min_hours: number;
  max_hours: number;
  preferred_hours: number;
}

export type ReadingPace = 'slow' | 'moderate' | 'fast' | 'varied';
export type SeriesPreference = 'standalone' | 'series' | 'no_preference';
export type ContentRating = 'G' | 'PG' | 'PG13' | 'R' | 'any';
export type PublicationEra = 'classic' | 'modern' | 'contemporary' | 'recent' | 'any';
export type DiscoveryFrequency = 'daily' | 'weekly' | 'monthly' | 'on_demand';

// Onboarding questions configuration
export const ONBOARDING_QUESTIONS = [
  {
    id: 'reading_frequency',
    text: 'How often do you listen to audiobooks?',
    type: 'single_choice' as const,
    options: ['Daily', 'Few times a week', 'Weekly', 'Monthly', 'Rarely'],
    category: 'habits'
  },
  {
    id: 'preferred_genres',
    text: 'Which genres do you enjoy most? (Select all that apply)',
    type: 'multiple_choice' as const,
    options: [
      'Fiction', 'Non-Fiction', 'Mystery', 'Romance', 'Science Fiction',
      'Fantasy', 'Thriller', 'Biography', 'History', 'Self-Help',
      'Business', 'True Crime', 'Horror', 'Young Adult', 'Poetry'
    ],
    category: 'preferences'
  },
  {
    id: 'favorite_authors',
    text: 'Who are some of your favorite authors? (Enter names separated by commas)',
    type: 'text' as const,
    category: 'preferences'
  },
  {
    id: 'book_length_preference',
    text: 'What\'s your preferred audiobook length?',
    type: 'single_choice' as const,
    options: ['Under 5 hours', '5-10 hours', '10-15 hours', '15-20 hours', 'Over 20 hours', 'No preference'],
    category: 'preferences'
  },
  {
    id: 'discovery_adventurousness',
    text: 'How adventurous are you when discovering new books?',
    type: 'rating' as const,
    min: 1,
    max: 10,
    labels: ['Stick to favorites', 'Love new discoveries'],
    category: 'discovery'
  },
  {
    id: 'series_preference',
    text: 'Do you prefer standalone books or series?',
    type: 'single_choice' as const,
    options: ['Standalone books', 'Book series', 'No preference'],
    category: 'preferences'
  },
  {
    id: 'content_sensitivity',
    text: 'Are there any content types you\'d prefer to avoid?',
    type: 'multiple_choice' as const,
    options: ['Violence', 'Strong language', 'Sexual content', 'Dark themes', 'None of these concern me'],
    category: 'content'
  },
  {
    id: 'trending_interest',
    text: 'How interested are you in trending/popular books?',
    type: 'rating' as const,
    min: 1,
    max: 10,
    labels: ['Not interested', 'Very interested'],
    category: 'discovery'
  }
] as const;

// Default settings
export const DEFAULT_DISCOVERY_PROFILE: Omit<DiscoveryProfile, 'id' | 'user_id' | 'last_updated'> = {
  preferred_genres: [],
  favorite_authors: [],
  preferred_narrators: [],
  reading_pace: 'moderate',
  content_preferences: {
    preferred_duration_range: {
      min_hours: 5,
      max_hours: 15,
      preferred_hours: 10
    },
    series_preference: 'no_preference',
    language_preferences: ['English'],
    content_rating_max: 'PG13',
    avoid_genres: [],
    avoid_authors: [],
    avoid_topics: [],
    preferred_publication_era: 'any'
  },
  discovery_settings: {
    discovery_frequency: 'weekly',
    scan_intensity: 5,
    include_trending: true,
    include_new_releases: true,
    include_classics: false,
    author_discovery_enabled: true,
    genre_exploration_enabled: true,
    similar_books_weight: 0.7,
    serendipity_factor: 0.3
  },
  reading_history_weight: 0.8,
  trending_influence: 0.4,
  similarity_threshold: 0.6,
  onboarding_responses: []
};

// Validation functions
export function validateDiscoveryProfile(profile: Partial<DiscoveryProfile>): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (profile.preferred_genres && profile.preferred_genres.length > 10) {
    errors.push('Too many preferred genres (max 10)');
  }

  if (profile.favorite_authors && profile.favorite_authors.length > 20) {
    errors.push('Too many favorite authors (max 20)');
  }

  if (profile.reading_history_weight !== undefined) {
    if (profile.reading_history_weight < 0 || profile.reading_history_weight > 1) {
      errors.push('Reading history weight must be between 0 and 1');
    }
  }

  if (profile.trending_influence !== undefined) {
    if (profile.trending_influence < 0 || profile.trending_influence > 1) {
      errors.push('Trending influence must be between 0 and 1');
    }
  }

  if (profile.similarity_threshold !== undefined) {
    if (profile.similarity_threshold < 0 || profile.similarity_threshold > 1) {
      errors.push('Similarity threshold must be between 0 and 1');
    }
  }

  if (profile.discovery_settings?.scan_intensity !== undefined) {
    if (profile.discovery_settings.scan_intensity < 1 || profile.discovery_settings.scan_intensity > 10) {
      errors.push('Scan intensity must be between 1 and 10');
    }
  }

  if (profile.content_preferences?.preferred_duration_range) {
    const range = profile.content_preferences.preferred_duration_range;
    if (range.min_hours < 0 || range.max_hours < 0 || range.preferred_hours < 0) {
      errors.push('Duration values must be positive');
    }
    if (range.min_hours > range.max_hours) {
      errors.push('Minimum duration cannot exceed maximum duration');
    }
    if (range.preferred_hours < range.min_hours || range.preferred_hours > range.max_hours) {
      errors.push('Preferred duration must be within min/max range');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export function validateOnboardingResponse(response: OnboardingResponse): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!response.question_id) {
    errors.push('Question ID is required');
  }

  if (!response.question_text) {
    errors.push('Question text is required');
  }

  if (response.response === undefined || response.response === null) {
    errors.push('Response is required');
  }

  const validResponseTypes = ['single_choice', 'multiple_choice', 'text', 'rating', 'range'];
  if (!validResponseTypes.includes(response.response_type)) {
    errors.push('Invalid response type');
  }

  if (response.response_type === 'rating' && typeof response.response === 'number') {
    if (response.response < 1 || response.response > 10) {
      errors.push('Rating must be between 1 and 10');
    }
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

// Utility functions
export function calculateDiscoveryCompatibility(
  profile: DiscoveryProfile,
  bookGenres: string[],
  bookAuthor: string
): number {
  let compatibility = 0.5; // Base compatibility

  // Genre matching
  const genreMatches = bookGenres.filter(genre => profile.preferred_genres.includes(genre)).length;
  const genreBonus = Math.min(genreMatches * 0.2, 0.4);
  compatibility += genreBonus;

  // Author matching
  if (profile.favorite_authors.includes(bookAuthor)) {
    compatibility += 0.3;
  }

  // Avoid genres penalty
  const avoidGenreMatches = bookGenres.filter(genre => profile.content_preferences.avoid_genres.includes(genre)).length;
  if (avoidGenreMatches > 0) {
    compatibility -= 0.5;
  }

  // Avoid authors penalty
  if (profile.content_preferences.avoid_authors.includes(bookAuthor)) {
    compatibility -= 0.8;
  }

  return Math.max(0, Math.min(1, compatibility));
}

export function generateDiscoveryRecommendations(
  profile: DiscoveryProfile,
  availableBooks: any[], // This would be Book[] in real implementation
  count: number = 10
): any[] {
  // This is a simplified version - real implementation would be more complex
  return availableBooks
    .map(book => ({
      ...book,
      compatibility_score: calculateDiscoveryCompatibility(
        profile,
        book.genre || [],
        book.author || ''
      )
    }))
    .filter(book => book.compatibility_score >= profile.similarity_threshold)
    .sort((a, b) => b.compatibility_score - a.compatibility_score)
    .slice(0, count);
}

export function updateProfileFromOnboarding(
  profile: DiscoveryProfile,
  responses: OnboardingResponse[]
): DiscoveryProfile {
  const updated = { ...profile };

  responses.forEach(response => {
    switch (response.question_id) {
      case 'preferred_genres':
        if (Array.isArray(response.response)) {
          updated.preferred_genres = response.response;
        }
        break;

      case 'favorite_authors':
        if (typeof response.response === 'string') {
          updated.favorite_authors = response.response
            .split(',')
            .map(author => author.trim())
            .filter(author => author.length > 0);
        }
        break;

      case 'book_length_preference':
        if (typeof response.response === 'string') {
          const durationMapping = {
            'Under 5 hours': { min_hours: 0, max_hours: 5, preferred_hours: 3 },
            '5-10 hours': { min_hours: 5, max_hours: 10, preferred_hours: 7 },
            '10-15 hours': { min_hours: 10, max_hours: 15, preferred_hours: 12 },
            '15-20 hours': { min_hours: 15, max_hours: 20, preferred_hours: 17 },
            'Over 20 hours': { min_hours: 20, max_hours: 50, preferred_hours: 25 },
            'No preference': { min_hours: 0, max_hours: 50, preferred_hours: 10 }
          };
          const mapping = durationMapping[response.response as keyof typeof durationMapping];
          if (mapping) {
            updated.content_preferences.preferred_duration_range = mapping;
          }
        }
        break;

      case 'discovery_adventurousness':
        if (typeof response.response === 'number') {
          updated.discovery_settings.serendipity_factor = response.response / 10;
        }
        break;

      case 'series_preference':
        if (typeof response.response === 'string') {
          const seriesMapping = {
            'Standalone books': 'standalone' as const,
            'Book series': 'series' as const,
            'No preference': 'no_preference' as const
          };
          const mapping = seriesMapping[response.response as keyof typeof seriesMapping];
          if (mapping) {
            updated.content_preferences.series_preference = mapping;
          }
        }
        break;

      case 'content_sensitivity':
        if (Array.isArray(response.response)) {
          const topicMapping = {
            'Violence': 'violence',
            'Strong language': 'strong_language',
            'Sexual content': 'sexual_content',
            'Dark themes': 'dark_themes'
          };
          updated.content_preferences.avoid_topics = response.response
            .map(item => topicMapping[item as keyof typeof topicMapping])
            .filter(Boolean);
        }
        break;

      case 'trending_interest':
        if (typeof response.response === 'number') {
          updated.trending_influence = response.response / 10;
          updated.discovery_settings.include_trending = response.response >= 5;
        }
        break;
    }
  });

  updated.onboarding_responses = responses;
  updated.last_updated = new Date().toISOString();

  return updated;
}

export function generatePersonalizedFairyMessage(profile: DiscoveryProfile): string {
  const { preferred_genres, discovery_settings } = profile;

  if (preferred_genres.length === 0) {
    return "Well honey, let's start by finding out what kinds of books make your heart sing!";
  }

  const topGenre = preferred_genres[0];
  const messages = {
    'Fiction': "Oh sugar, I just love a good story! Let's find you some delicious fiction!",
    'Mystery': "Well honey, nothing beats a good mystery to keep you guessing!",
    'Romance': "Bless your heart, love stories are the sweetest thing! Let's find you some romance!",
    'Science Fiction': "Oh my stars, exploring new worlds through books is just magical!",
    'Fantasy': "Well sugar, fantasy books are like fairy tales for grown-ups - my favorite!",
    'Non-Fiction': "Honey, learning new things is sweeter than sweet tea on a hot day!",
    'Biography': "Well sugar, reading about real people's lives is just fascinating!",
    'Thriller': "Oh my, edge-of-your-seat stories that'll keep you up all night!",
    'Horror': "Bless your brave heart, you like the scary ones! I'll find you some spine-tinglers!"
  };

  const baseMessage = messages[topGenre as keyof typeof messages] ||
    `Well honey, ${topGenre.toLowerCase()} books are wonderful choices!`;

  if (discovery_settings.serendipity_factor > 0.7) {
    return `${baseMessage} And sugar, I love that you're adventurous - let's discover something completely new!`;
  }

  return baseMessage;
}

export function calculateProfileCompleteness(profile: DiscoveryProfile): number {
  let completeness = 0;
  let totalFields = 0;

  // Required fields (20% each)
  const requiredFields = [
    { field: profile.preferred_genres.length > 0, weight: 0.25 },
    { field: profile.favorite_authors.length > 0, weight: 0.15 },
    { field: profile.content_preferences.preferred_duration_range.preferred_hours > 0, weight: 0.15 },
    { field: profile.onboarding_responses.length >= 5, weight: 0.45 }
  ];

  requiredFields.forEach(({ field, weight }) => {
    if (field) completeness += weight;
    totalFields += weight;
  });

  return Math.round((completeness / totalFields) * 100);
}

export function isProfileComplete(profile: DiscoveryProfile): boolean {
  return calculateProfileCompleteness(profile) >= 80;
}

export function getRecommendedNextSteps(profile: DiscoveryProfile): string[] {
  const steps: string[] = [];

  if (profile.preferred_genres.length === 0) {
    steps.push('Select your favorite book genres');
  }

  if (profile.favorite_authors.length === 0) {
    steps.push('Add some favorite authors');
  }

  if (profile.onboarding_responses.length < 5) {
    steps.push('Complete the discovery preferences quiz');
  }

  if (profile.preferred_narrators.length === 0) {
    steps.push('Add preferred narrators (optional)');
  }

  if (steps.length === 0) {
    steps.push('Your profile is complete! Start discovering books!');
  }

  return steps;
}

export function exportProfileForAnalytics(profile: DiscoveryProfile): Record<string, any> {
  return {
    user_id: profile.user_id,
    genre_count: profile.preferred_genres.length,
    author_count: profile.favorite_authors.length,
    reading_pace: profile.reading_pace,
    scan_intensity: profile.discovery_settings.scan_intensity,
    serendipity_factor: profile.discovery_settings.serendipity_factor,
    trending_influence: profile.trending_influence,
    profile_completeness: calculateProfileCompleteness(profile),
    last_updated: profile.last_updated
  };
}

// Type guards
export function isDiscoveryProfile(obj: any): obj is DiscoveryProfile {
  return (
    obj &&
    typeof obj.id === 'string' &&
    typeof obj.user_id === 'string' &&
    Array.isArray(obj.preferred_genres) &&
    Array.isArray(obj.favorite_authors) &&
    obj.content_preferences &&
    obj.discovery_settings &&
    typeof obj.reading_history_weight === 'number' &&
    Array.isArray(obj.onboarding_responses)
  );
}

export function isOnboardingResponse(obj: any): obj is OnboardingResponse {
  return (
    obj &&
    typeof obj.question_id === 'string' &&
    typeof obj.question_text === 'string' &&
    obj.response !== undefined &&
    ['single_choice', 'multiple_choice', 'text', 'rating', 'range'].includes(obj.response_type) &&
    typeof obj.timestamp === 'string'
  );
}