import React, { useState, useEffect, useCallback } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';
import nightBackgroundImage from 'figma:asset/31aa70c632babf51c2a70ca5784f3bb16469577f.png';
import dayBackgroundImage from 'figma:asset/3d1f37365896b3e3dec9abedc8d76e85a954a0ab.png';
import fairyCharacterImage from 'figma:asset/162f942c140004a24aac627eed9ba511f26ce648.png';

// Move the greetings array outside the component to prevent re-creation
const FLIRTY_GREETINGS = [
  "Well hey there, handsome stranger... Ready to get lost in some stories together?",
  "Sugar, you just made my day brightin' up like sunshine! Want some literary magic?",
  "Well butter my biscuit, aren't you a sight for sore eyes! Let's find you somethin' steamy.",
  "Honey child, you've got that book lover sparkle in your eyes... I like that in a person.",
  "Darlin', I've been waitin' for someone like you to stumble into my little corner of paradise.",
  "Sweet as peach cobbler! You ready to let me whisper some stories in your ear?",
  "Well I'll be! Another gorgeous soul lookin' for their next literary adventure.",
  "Sugar pie, you've found your way to the most enchanting library this side of heaven.",
  "Hey there, beautiful... Want me to show you around my magical collection?",
  "Honey, you're lookin' at me like you want somethin' special... I got just the thing.",
  "Well bless your heart, you wandered right into fairy territory! Lucky me.",
  "Darlin', that smile of yours could charm the stars right out of the sky.",
  "Sweet thing, I can see you've got that hungry look... hungry for good stories, that is!",
  "Sugar, you're makin' this old fairy's heart flutter like butterfly wings.",
  "Well ain't you just precious as a Georgia peach! Ready for some audio magic?",
  "Honey child, I've been savin' my best stories for someone exactly like you.",
  "Come on now, sugar... don't be shy. Let me take real good care of you.",
  "Darlin', I promise I'll give you the sweetest literary experience you ever did have.",
  "Well hello there, gorgeous! Ready to let this fairy grant your reading wishes?",
  "Sugar, you look like you could use some of my special brand of storytelling magic."
];

export function BookFairyLanding() {
  const { signInWithGoogle, user } = useAuth();
  const { theme } = useTheme();
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);

  // Typewriter effect
  useEffect(() => {
    if (!isTyping) return;

    const currentMessage = FLIRTY_GREETINGS[currentMessageIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        // Wait 3 seconds then start next message
        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % FLIRTY_GREETINGS.length);
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

  const handleSignIn = async () => {
    console.log('🧚‍♀️ BookFairy: Sign-in button clicked!');
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('🧚‍♀️ BookFairy: Sign in error from landing page:', error);
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
          {/* Speech Bubble with Typewriter Effect */}
          <div className="mb-8">
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
            
            {/* Subtle hint to click button */}
            <div className="text-center mt-3">
              <p className={`text-xs opacity-60 ${displayedText.length > 50 ? 'animate-pulse' : 'opacity-0'}`}>
                💫 Click below to get started, sugar! 💫
              </p>
            </div>
          </div>

          {/* Login Button */}
          <div className="flex justify-center">
            <button 
              onClick={handleSignIn}
              className={`
                py-4 px-8 rounded-full text-lg font-semibold text-white
                transition-all duration-300 transform hover:scale-105
                shadow-xl hover:shadow-2xl backdrop-blur-sm
                min-w-[240px] max-w-[280px]
                ${theme === 'night' 
                  ? 'bg-gradient-to-r from-purple-500/90 to-pink-500/90 border border-purple-300/60' 
                  : 'bg-gradient-to-r from-blue-500/90 to-emerald-500/90 border border-blue-300/60'
                }
              `}
            >
              Sign In with Google ✨
            </button>
          </div>
        </div>


      </div>
    </div>
  );
}