# BookFairy Quickstart Guide

## User Story Validation Scenarios

This guide provides manual testing scenarios to validate that BookFairy meets all functional requirements and user stories. Each scenario corresponds to acceptance criteria from the feature specification.

## Prerequisites

- Browser: Chrome 90+, Safari 14+, or Firefox 88+
- Network connection for API integrations
- Google account for OAuth authentication
- Valid Hardcover API key

## Scenario 1: First-Time User Complete Flow

**Objective**: Validate the complete first-time user experience from landing to dashboard access.

### Steps:
1. **Navigate to BookFairy landing page**
   - Verify fairy character is flying around the screen
   - Confirm typewriter bubble shows rotating greetings
   - Check that no dashboard access is available

2. **Initiate Google OAuth login**
   - Click sign-in button
   - Verify redirect to Google OAuth consent
   - Complete Google authentication
   - Confirm redirect back to BookFairy

3. **Hardcover API key prompt**
   - Verify immediate prompt for Hardcover API key
   - Enter invalid key → Check fairy sass error message
   - Enter valid key → Confirm acceptance

4. **PWA Installation Onboarding**
   - Verify fairy explains PWA installation requirement
   - Test browser detection (PC/Android/iOS guidance)
   - Complete installation quiz:
     - Wrong answer → Verify fairy sass, retry required
     - Correct answer → Proceed to installation
   - Trigger PWA install prompt
   - Verify fairy ✨👌 flash before prompt
   - Complete PWA installation

5. **Push Notification Setup**
   - Verify fairy explains notification requirement
   - Deny permission → Check fairy sass, retry required
   - Accept permission → Confirm success message
   - Verify fairy sparkles: "Butter my biscuits, you did it!"

6. **Dashboard Access**
   - Confirm redirect to dashboard
   - Verify all navigation options available
   - Test readar discovery immediately presents suggestions

### Expected Results:
- ✅ Smooth authentication flow
- ✅ Mandatory onboarding completion
- ✅ PWA installation confirmed
- ✅ Push notifications enabled
- ✅ Dashboard access granted
- ✅ Fairy personality throughout flow

---

## Scenario 2: Returning User with Valid Credentials

**Objective**: Validate streamlined experience for users with completed onboarding.

### Steps:
1. **Login with existing Google account**
   - Navigate to BookFairy
   - Click sign-in
   - Complete OAuth (should be faster with existing session)

2. **Credential validation**
   - Verify Hardcover API key validation
   - Check Audiobookshelf account exists
   - Confirm onboarding status (completed <60 days ago)

3. **Direct dashboard access**
   - Verify immediate dashboard access
   - Confirm user library loads
   - Check wishlist status appears

### Expected Results:
- ✅ Fast login process
- ✅ No onboarding repetition
- ✅ Immediate dashboard access
- ✅ Existing user data loads correctly

---

## Scenario 3: 60-Day Onboarding Renewal

**Objective**: Validate mandatory onboarding renewal flow.

### Steps:
1. **Login with account >60 days old**
   - Use account with last_onboarding_date >60 days ago
   - Complete Google OAuth login

2. **Renewal flow trigger**
   - Verify onboarding flow triggers before dashboard
   - Confirm fairy explains renewal requirement
   - Complete renewal quiz and PWA/notification reconfirmation

3. **Dashboard access restored**
   - Verify successful completion unlocks dashboard
   - Check renewal date updated

### Expected Results:
- ✅ Renewal flow triggers correctly
- ✅ Mandatory completion enforced
- ✅ Dates updated properly
- ✅ Dashboard access restored

---

## Scenario 4: Fairy Character Animation Cycle

**Objective**: Validate fairy animation states and synchronization.

### Steps:
1. **Normal animation mode**
   - Verify fairy flies randomly around screen
   - Trigger new message
   - Confirm fairy lands above speech bubble before text starts
   - Watch typewriter effect while fairy stays perched
   - Verify fairy takes off after message completion
   - Time flight intervals (should be 5-12 seconds)

2. **Accessibility mode (prefers-reduced-motion)**
   - Enable prefers-reduced-motion in browser
   - Trigger new message
   - Verify fairy teleports instantly to typing position
   - Confirm no smooth animations occur
   - Check functionality remains intact

3. **Message synchronization**
   - Queue multiple messages rapidly
   - Verify fairy completes current cycle before starting next
   - Confirm typewriter never starts without fairy perched

### Expected Results:
- ✅ Complete animation cycle: flying → landing → typing → takeoff
- ✅ Center-above positioning consistent
- ✅ Typewriter synchronization perfect
- ✅ Accessibility mode works (teleport)
- ✅ No animation conflicts

---

## Scenario 5: Readar Discovery System

**Objective**: Validate passive discovery and effortless book surfacing.

### Steps:
1. **Passive discovery access**
   - Navigate to dashboard without searching
   - Verify readar system activates automatically
   - Check radar-like scanning visual metaphors appear
   - Confirm book suggestions surface without user input

2. **Effortless suggestions test**
   - Access recommendations with minimal interaction history
   - Verify system provides trending/popular books
   - Confirm no manual query building required

3. **Automatic curation**
   - View discovery section after establishing preferences
   - Verify personalized recommendations appear
   - Check that suggestions adapt to user behavior

### Expected Results:
- ✅ Passive discovery works immediately
- ✅ Radar scanning metaphors visible
- ✅ Effortless suggestions provided
- ✅ No manual input required for basic discovery

---

## Scenario 6: Book Discovery and Wishlist Management

**Objective**: Validate book search, wishlist queue, and auto-promotion.

### Steps:
1. **Book search and discovery**
   - Search by author name
   - Search by book title
   - Browse by genre
   - View book cards with cover, title, author, narrator, synopsis

2. **Wishlist management**
   - Add book to wishlist
   - Verify queue position shown
   - Check 30-day expiration timer
   - Test auto-promotion when slots available

3. **Book details and actions**
   - View detailed book information
   - Test Download button
   - Use Back navigation
   - Verify synopsis character limit (≤500)

### Expected Results:
- ✅ All search methods work
- ✅ Book cards display correctly
- ✅ Wishlist queue functions properly
- ✅ Auto-promotion logic works
- ✅ 30-day expiration enforced

---

## Scenario 7: Library and Notification Management

**Objective**: Validate library tracking and push notification system.

### Steps:
1. **Download completion**
   - Simulate audiobook download completion
   - Verify push notification sent
   - Check fairy's Southern voice in notification
   - Confirm book appears in library

2. **Library management**
   - View personal library
   - Update book completion status
   - Add ratings and notes
   - Verify no playback functionality (library only)

3. **Notification center**
   - View all notifications
   - Test notification types (download, wishlist, new author)
   - Mark notifications as read
   - Verify Audiobookshelf synchronization

### Expected Results:
- ✅ Push notifications work correctly
- ✅ Fairy voice in messages
- ✅ Library tracks correctly
- ✅ No playback attempted
- ✅ Notification management works

---

## Scenario 8: Theme and Accessibility Testing

**Objective**: Validate theme switching and accessibility compliance.

### Steps:
1. **Theme switching**
   - Test manual day/night mode toggle
   - Verify system theme auto-detection
   - Confirm smooth transitions (<300ms)
   - Check visual integrity in both themes

2. **Accessibility validation**
   - Test keyboard navigation through all interfaces
   - Verify WCAG contrast ratios (4.5:1 normal, 3:1 large text)
   - Check aria-labels on interactive elements
   - Test screen reader compatibility

3. **Animation accessibility**
   - Enable prefers-reduced-motion
   - Verify all animations degrade gracefully
   - Confirm functionality preserved
   - Test with various accessibility settings

### Expected Results:
- ✅ Theme switching works smoothly
- ✅ Both themes maintain visual integrity
- ✅ WCAG compliance verified
- ✅ Full keyboard navigation
- ✅ Screen reader compatibility
- ✅ Animation degradation graceful

---

## Scenario 9: Error Handling and Edge Cases

**Objective**: Validate error handling with fairy personality.

### Steps:
1. **Authentication errors**
   - Trigger OAuth failure
   - Verify fairy delivers sass message with retry options
   - Test invalid Hardcover API key handling
   - Check network connectivity issues

2. **Browser compatibility**
   - Test on unsupported browser (old Firefox)
   - Verify fairy guides to supported browser
   - Test iOS Chrome (unsupported) → Safari guidance
   - Test Android Firefox → Chrome guidance

3. **PWA installation failures**
   - Deny PWA installation
   - Verify fairy sass response
   - Confirm retry enforcement
   - Test skip attempts blocked

### Expected Results:
- ✅ All errors handled gracefully
- ✅ Fairy personality in error messages
- ✅ Clear retry options provided
- ✅ Browser guidance appropriate
- ✅ Mandatory flows enforced

---

## Scenario 10: Performance and Loading

**Objective**: Validate performance requirements and immersion.

### Steps:
1. **Load time testing**
   - Measure initial page load (<2 seconds)
   - Test theme switching speed (<300ms)
   - Verify OAuth initiation time (<500ms)
   - Check fairy animation smoothness (60fps)

2. **Mobile responsiveness**
   - Test on various screen sizes (320px minimum)
   - Verify touch targets ≥44px
   - Check mobile-first design principles
   - Test PWA functionality on mobile

3. **Network conditions**
   - Test on slow 3G connection
   - Verify lazy loading of non-critical resources
   - Check offline PWA functionality
   - Confirm graceful degradation

### Expected Results:
- ✅ All performance targets met
- ✅ Smooth 60fps animations
- ✅ Mobile-first design responsive
- ✅ Offline functionality works
- ✅ Graceful degradation on slow networks

---

## Validation Checklist

After completing all scenarios, verify:

### Constitutional Compliance
- [ ] **Fairy Voice Is Sacred**: Continuous rotation, interactive agent behavior, synchronized animations
- [ ] **Login Must Be Seamless**: Responsive OAuth, clear feedback, accessibility
- [ ] **Accessibility Is Non-Negotiable**: WCAG compliance, keyboard navigation, graceful degradation
- [ ] **Consistency Across Themes**: Visual integrity maintained in both day/night modes
- [ ] **Discovery Over Search**: Readar system provides passive discovery with radar metaphors
- [ ] **Lazy Librarian Spirit**: Effortless suggestions, auto-curation, minimal user effort
- [ ] **Performance & Immersion**: Fast loading, smooth animations, no compromise on magical elements

### Functional Requirements
- [ ] All 33 functional requirements validated
- [ ] Authentication and setup flows complete
- [ ] Discovery and search systems functional
- [ ] Library and wishlist management working
- [ ] Theme and interface responsive
- [ ] Fairy character behavior correct
- [ ] Accessibility requirements met

### User Experience
- [ ] Magical, personality-driven experience maintained
- [ ] Southern fairy voice consistent throughout
- [ ] Mobile-first design principles followed
- [ ] PWA installation and notifications working
- [ ] Error handling maintains character immersion

## Success Criteria

BookFairy is ready for production when:
1. All 10 scenarios pass completely
2. Constitutional compliance verified
3. Performance targets met
4. Accessibility standards exceeded
5. User experience maintains magical immersion
6. All edge cases handled gracefully