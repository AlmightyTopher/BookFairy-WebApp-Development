import React, { useState, useEffect } from 'react';
import { BookFairyLanding } from './components/BookFairyLanding';
import { GoogleOAuthPage } from './components/GoogleOAuthPage';
import { Dashboard } from './components/Dashboard';
import { OnboardingFlow } from './components/OnboardingFlow';
import { AuthProvider, useAuth } from './components/AuthProvider';
import { ThemeProvider, useTheme } from './components/ThemeProvider';
import { BookFairy } from './components/BookFairy';
import { FloatingBookFairy } from './components/FloatingBookFairy';
import './styles/bookfairy.css';

function AppContent() {
  const { user, loading } = useAuth();
  const { theme } = useTheme();
  const [showOnboarding, setShowOnboarding] = useState(false);
  const [isOnboardingComplete, setIsOnboardingComplete] = useState(false);
  const [showFloatingFairy, setShowFloatingFairy] = useState(false);


  useEffect(() => {
    // Check if user needs onboarding after authentication
    if (user && !loading) {
      // Check if user has completed onboarding in the last 60 days
      const lastOnboarding = localStorage.getItem('bookfairy_last_onboarding');
      const now = new Date().getTime();
      const sixtyDays = 60 * 24 * 60 * 60 * 1000;
      
      if (!lastOnboarding || now - parseInt(lastOnboarding) > sixtyDays) {
        setShowOnboarding(true);
      } else {
        setIsOnboardingComplete(true);
      }
    }
  }, [user, loading]);

  // Show floating fairy on ALL pages always!
  useEffect(() => {
    setShowFloatingFairy(true);
  }, []);

  const handleOnboardingComplete = () => {
    setShowOnboarding(false);
    setIsOnboardingComplete(true);
    localStorage.setItem('bookfairy_last_onboarding', new Date().getTime().toString());
  };



  let pageContent;

  if (loading) {
    pageContent = (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="fairy-sparkle mb-4">✨</div>
          <div>Loading your magical library...</div>
        </div>
      </div>
    );
  } else if (!user) {
    pageContent = <BookFairyLanding />;
  } else if (showOnboarding) {
    pageContent = <OnboardingFlow onComplete={handleOnboardingComplete} />;
  } else if (!isOnboardingComplete) {
    pageContent = (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="fairy-sparkle mb-4">✨</div>
          <div>Setting up your magical library...</div>
        </div>
      </div>
    );
  } else {
    pageContent = <Dashboard />;
  }

  return (
    <div className="bookfairy-mobile-container">
      {pageContent}
      
      {/* FLOATING FAIRY ON ALL PAGES! */}
      {showFloatingFairy && (
        <FloatingBookFairy />
      )}
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppContent />
      </ThemeProvider>
    </AuthProvider>
  );
}