import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';
import nightBackgroundImage from 'figma:asset/31aa70c632babf51c2a70ca5784f3bb16469577f.png';
import dayBackgroundImage from 'figma:asset/3d1f37365896b3e3dec9abedc8d76e85a954a0ab.png';

interface GoogleOAuthPageProps {
  onBack: () => void;
}

// Southern OAuth-focused greetings outside component to prevent re-creation
const OAUTH_GREETINGS = [
  "Alright sugar, time to pick your Google account so I can get to know ya better!",
  "Well honey, just choose which Google account you wanna use and we'll be all set!",
  "Darlin', I need you to sign in with your Google account so I can work my magic properly.",
  "Sweet thing, go ahead and pick your Google account from the list below, won't ya?",
  "Sugar pie, just tap on your Google account and I'll take real good care of you!",
  "Honey child, choose that Google account of yours and let's get this party started!",
  "Well butter my biscuit, just sign in with Google and I'll show you wonders!",
  "Darlin', your Google account is the key to all my magical book treasures!",
  "Sweet as peach cobbler! Just pick your account and let me spoil you rotten!",
  "Sugar, I'm just waitin' on you to choose that Google account so we can begin!",
  "Honey, don't be shy now - pick your Google account and let's make some magic!",
  "Well bless your heart, just sign in with Google and I'll grant all your reading wishes!",
  "Darlin', that Google account of yours is gonna open up a whole world of stories!",
  "Sweet thing, just one little tap on your Google account and we're off to paradise!",
  "Sugar, I promise once you sign in with Google, you'll never want to leave my library!"
];

export function GoogleOAuthPage({ onBack }: GoogleOAuthPageProps) {
  const { signInWithGoogle } = useAuth();
  const { theme } = useTheme();
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) return;

    const currentMessage = OAUTH_GREETINGS[currentMessageIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        // Wait 3 seconds then start next message
        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % OAUTH_GREETINGS.length);
          setDisplayedText('');
          setIsTyping(true);
        }, 3000);
        clearInterval(typeInterval);
      }
    }, 50); // 50ms per character for natural typing speed

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex, isTyping]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  const handleGoogleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in error:', error);
    }
  };

  return (
    <div className="min-h-screen relative overflow-hidden">
      {/* Theme Toggle */}
      <ThemeToggle />
      
      {/* Background */}
      <div className="absolute inset-0">
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${theme === 'night' ? nightBackgroundImage : dayBackgroundImage})`
          }}
        />
        {/* Light overlay for night mode only */}
        {theme === 'night' && (
          <div className="absolute inset-0 bg-black/10" />
        )}
      </div>
      
      {/* Content */}
      <div className="relative z-10 min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm mx-auto">
          
          {/* Google OAuth Interface */}
          <div className="mb-6">
            <div className={`
              bg-white/95 backdrop-blur-sm rounded-2xl p-6 shadow-xl 
              ${theme === 'night' 
                ? 'border border-white/40' 
                : 'border border-white/60'
              }
            `}>
              <div className="flex items-center justify-center mb-4">
                <div className="w-8 h-8 mr-3">
                  <svg viewBox="0 0 24 24" className="w-full h-full">
                    <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-gray-800">Sign in with Google</h3>
              </div>
              
              <p className="text-sm text-gray-600 mb-4">
                Choose your Google account to continue
              </p>
              
              <button 
                onClick={handleGoogleSignIn}
                className={`
                  w-full py-3 px-4 rounded-lg font-medium text-white
                  transition-all duration-300 transform hover:scale-105
                  shadow-md hover:shadow-lg
                  ${theme === 'night' 
                    ? 'bg-gradient-to-r from-purple-600 to-pink-600' 
                    : 'bg-gradient-to-r from-blue-600 to-emerald-600'
                  }
                `}
              >
                Continue with Google
              </button>
            </div>
          </div>

          {/* Speech Bubble with Typewriter Effect */}
          <div className="mb-6">
            <div className={`
              bg-white/95 text-gray-800
              backdrop-blur-sm rounded-2xl p-5 shadow-xl 
              ${theme === 'night' 
                ? 'border border-white/40' 
                : 'border border-white/60'
              }
              min-h-[80px] flex items-center
            `}>
              <p className="text-sm leading-relaxed font-medium">
                {displayedText}
                <span className={`inline-block w-0.5 h-4 bg-gray-800 ml-1 ${showCursor ? 'opacity-100' : 'opacity-0'}`} />
              </p>
            </div>
          </div>

          {/* Back to Home Button */}
          <div className="flex justify-center">
            <button 
              onClick={onBack}
              className={`
                py-3 px-6 rounded-full font-medium text-white
                transition-all duration-300 transform hover:scale-105
                shadow-lg hover:shadow-xl backdrop-blur-sm
                ${theme === 'night' 
                  ? 'bg-white/20 border border-white/40 hover:bg-white/30' 
                  : 'bg-black/20 border border-black/30 hover:bg-black/30'
                }
              `}
            >
              ← Back to Home
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}