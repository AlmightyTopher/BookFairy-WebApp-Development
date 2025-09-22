<!--
Sync Impact Report:
- Version change: 1.0.0 → 1.1.0 (Expanded fairy character interactivity requirements)
- Modified principles: I. Fairy Voice Is Sacred (expanded with interactive character behavior)
- Added sections: None
- Removed sections: None
- Templates requiring updates:
  ✅ constitution.md (this file)
  ⚠ pending plan-template.md (may need BookFairy-specific guidance)
  ⚠ pending spec-template.md (may need UI/UX requirements alignment)
  ⚠ pending tasks-template.md (may need BookFairy task categories)
- Follow-up TODOs: None
-->

# BookFairy Constitution

## Core Principles

### I. Fairy Voice Is Sacred
The typewriter bubble MUST continuously rotate through greetings with no pause or skip controls. This rotation is core to BookFairy's personality and MUST be preserved across all implementations. The fairy character MUST be an interactive agent, not decoration. The fairy MUST visibly land above the speech bubble to trigger new text, reinforcing the illusion that BookFairy is speaking. While text is typing, the fairy MUST stay perched. Between messages, the fairy MAY fly around the screen before returning to trigger the next message. Personality guidelines: warm, playful, slightly cheeky, accessible to all ages. Never clinical or sterile.

**Rationale**: The fairy voice and interactive character behavior establishes the magical, welcoming personality that differentiates BookFairy from utilitarian library apps. The visible cause-and-effect between fairy landing and text appearing reinforces the illusion of a living magical assistant.

### II. Login Must Be Seamless
OAuth box MUST be flexible and responsive, never clipped or crammed. Sign-in button MUST be obvious and aria-labeled. Feedback MUST be shown if login hangs or fails. Google OAuth integration via Supabase Auth is the gateway to the magical library experience.

**Rationale**: Authentication friction kills the magical first impression and prevents users from accessing their personalized library.

### III. Accessibility Is Non-Negotiable
WCAG color contrast standards MUST be met. Keyboard navigation MUST work throughout the application. Screen reader support MUST be comprehensive. Both light and dark themes MUST pass accessibility checks. All flair (animations, overlays, effects) MUST degrade gracefully for prefers-reduced-motion or low-contrast settings.

**Rationale**: Magic should be accessible to everyone, regardless of ability or assistive technology needs.

### IV. Consistency Across Themes
Bubble, OAuth box, background, and all UI elements MUST maintain visual integrity in both light and dark themes. Text MUST always be legible. Theme switching MUST feel seamless and preserve the immersive experience.

**Rationale**: The theme is part of the experience, not just a skin. Users should feel the same magic regardless of their preference.

### V. Discovery Over Search ("Readar" Principle)
BookFairy MUST help users find books, not just show a static library. Visual metaphors (radar sweep, sonar pulses, sparkles) SHOULD be used to reinforce scanning for hidden treasures. Discovery MUST be as important as search functionality.

**Rationale**: The "Readar" concept transforms book discovery from work into play, aligning with the magical librarian assistant role.

### VI. Lazy Librarian Spirit
BookFairy MUST suggest or retrieve books for users without making them work. Auto-curation and recommendations MUST feel effortless — "magical assistance," not manual query building. The principle is: fewer clicks, more delight.

**Rationale**: Automation should amplify delight, not overwhelm. Users want magical assistance, not complex interfaces.

### VII. Performance & Immersion
Landing page MUST stay lightweight and fast. Lazy-load anything not critical to first paint. Radar/sonar effects, book-finding animations, and other magical elements MUST never compromise load time. BookFairy MUST feel light and responsive.

**Rationale**: Magic that loads slowly isn't magical — it's frustrating. Performance is a feature of the magical experience.

## Performance Standards

All critical user interactions MUST complete within:
- Initial page load: < 2 seconds
- Theme switching: < 300ms
- OAuth sign-in initiation: < 500ms
- Typewriter animation cycle: smooth and uninterrupted
- Fairy landing animation: < 200ms

Book discovery features MUST be optimized for mobile-first usage patterns.

## Accessibility Standards

All components MUST support:
- Keyboard navigation with visible focus indicators
- Screen reader announcements for dynamic content updates
- High contrast mode compatibility
- Reduced motion preferences
- Touch target sizes ≥ 44px for mobile devices

Color schemes MUST maintain minimum 4.5:1 contrast ratio for normal text and 3:1 for large text.

## Governance

This constitution supersedes all other development practices. All features, UI changes, and technical decisions MUST align with these principles.

**Amendment Process**: Constitutional changes require documented rationale, impact assessment, and validation that the change preserves the core BookFairy experience.

**Compliance Review**: All pull requests MUST verify constitutional compliance. Any complexity or deviation MUST be explicitly justified against these principles.

**Development Guidance**: Use CLAUDE.md for runtime development guidance while ensuring all implementations respect this constitution.

**Version**: 1.1.0 | **Ratified**: 2025-09-21 | **Last Amended**: 2025-09-21