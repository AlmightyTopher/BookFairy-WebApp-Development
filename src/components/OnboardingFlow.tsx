import React, { useState, useEffect } from 'react';
import { useAuth } from './AuthProvider';
import { useTheme } from './ThemeProvider';
import { ThemeToggle } from './ThemeToggle';
import { BookFairy, BookFairyMessages } from './BookFairy';
import nightBackgroundImage from 'figma:asset/31aa70c632babf51c2a70ca5784f3bb16469577f.png';
import dayBackgroundImage from 'figma:asset/3d1f37365896b3e3dec9abedc8d76e85a954a0ab.png';

interface OnboardingFlowProps {
  onComplete: () => void;
}

type OnboardingStep = 
  | 'welcome'
  | 'hardcover-api' 
  | 'fairy-disclaimer' 
  | 'device-choice' 
  | 'fairy-prep' 
  | 'quiz' 
  | 'pwa-install' 
  | 'push-request' 
  | 'confirmation';

// Flirty onboarding greetings outside component to prevent re-creation
const ONBOARDING_GREETINGS = [
  "Well sugar, looks like you're ready to get this magical library set up!",
  "Honey child, I'm so excited to help you discover your next favorite story!",
  "Darlin', let me walk you through settin' up your perfect reading paradise.",
  "Sweet thing, we're about to create something truly special together!",
  "Sugar pie, I promise this setup will be smoother than Georgia peach pie!",
  "Well hey there, gorgeous! Ready to let me work my literary magic for you?",
  "Honey, you're in for such a treat once we get everything all prettied up!",
  "Darlin', trust me - this little setup is gonna make your reading dreams come true!",
  "Sweet as honey, let's get you all configured for the best audiobook experience!",
  "Sugar, I've been waiting to help someone as lovely as you set up their library!"
];

export function OnboardingFlow({ onComplete }: OnboardingFlowProps) {
  const { user, updateUserProfile } = useAuth();
  const { theme } = useTheme();
  const messages = BookFairyMessages();
  
  const [currentStep, setCurrentStep] = useState<OnboardingStep>('welcome');
  const [hardcoverKey, setHardcoverKey] = useState('');
  const [selectedDevice, setSelectedDevice] = useState<'pc' | 'android' | 'ios' | null>(null);
  const [quizAttempts, setQuizAttempts] = useState(0);
  const [showMagicalFlash, setShowMagicalFlash] = useState(false);
  
  // Typewriter effect state
  const [displayedText, setDisplayedText] = useState('');
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0);
  const [isTyping, setIsTyping] = useState(true);
  const [showCursor, setShowCursor] = useState(true);
  const [showContent, setShowContent] = useState(false);

  // Check if user already has Hardcover key
  useEffect(() => {
    if (user?.hardcoverApiKey && currentStep !== 'welcome') {
      setCurrentStep('fairy-disclaimer');
    }
  }, [user, currentStep]);

  // Typewriter effect for welcome message
  useEffect(() => {
    if (currentStep !== 'welcome' || !isTyping) return;

    const currentMessage = ONBOARDING_GREETINGS[currentMessageIndex];
    let charIndex = 0;

    const typeInterval = setInterval(() => {
      if (charIndex < currentMessage.length) {
        setDisplayedText(currentMessage.slice(0, charIndex + 1));
        charIndex++;
      } else {
        setIsTyping(false);
        setShowContent(true);
        // Wait 2 seconds then start next message
        setTimeout(() => {
          setCurrentMessageIndex((prev) => (prev + 1) % ONBOARDING_GREETINGS.length);
          setDisplayedText('');
          setIsTyping(true);
        }, 2000);
        clearInterval(typeInterval);
      }
    }, 50);

    return () => clearInterval(typeInterval);
  }, [currentMessageIndex, isTyping, currentStep]);

  // Cursor blinking effect
  useEffect(() => {
    const cursorInterval = setInterval(() => {
      setShowCursor(prev => !prev);
    }, 530);

    return () => clearInterval(cursorInterval);
  }, []);

  const handleHardcoverSubmit = async () => {
    if (!hardcoverKey.trim()) {
      alert('Please enter your Hardcover API key, sugar!');
      return;
    }

    try {
      await updateUserProfile({ hardcoverApiKey: hardcoverKey });
      setCurrentStep('fairy-disclaimer');
    } catch (error) {
      console.error('Error saving Hardcover key:', error);
      alert('Oops! Something went wrong saving your API key. Please try again.');
    }
  };

  const handleQuizAnswer = (answer: string) => {
    const correctAnswer = "Install this app as a PWA so I can send ya notifications.";
    
    if (answer === correctAnswer) {
      setCurrentStep('pwa-install');
      triggerMagicalFlash();
    } else {
      setQuizAttempts(prev => prev + 1);
      // Show sassy response and reset to prep
      alert(messages.getRandomSassyResponse());
    }
  };

  const triggerMagicalFlash = () => {
    setShowMagicalFlash(true);
    setTimeout(() => setShowMagicalFlash(false), 2000);
  };

  const handlePWAInstall = async () => {
    // This would trigger the PWA install prompt
    // For demo purposes, we'll simulate it
    const installPrompt = (window as any).deferredPrompt;
    
    if (installPrompt) {
      const { outcome } = await installPrompt.prompt();
      if (outcome === 'accepted') {
        setCurrentStep('push-request');
      } else {
        alert(messages.getRandomSassyResponse());
      }
    } else {
      // If no install prompt available, proceed (user might have already installed)
      setCurrentStep('push-request');
    }
  };

  const handlePushRequest = async () => {
    try {
      const permission = await Notification.requestPermission();
      if (permission === 'granted') {
        setCurrentStep('confirmation');
      } else {
        alert(messages.getRandomSassyResponse());
      }
    } catch (error) {
      console.error('Push notification error:', error);
      alert('Well sugar, we need those notifications to keep you posted!');
    }
  };

  const handleComplete = async () => {
    try {
      // Create Audiobookshelf account (simulated)
      await updateUserProfile({ audiobookshelfCreated: true });
      onComplete();
    } catch (error) {
      console.error('Error completing onboarding:', error);
    }
  };

  const getBrowserInstructions = () => {
    const userAgent = navigator.userAgent;
    const isIOS = /iPad|iPhone|iPod/.test(userAgent);
    const isAndroid = /Android/.test(userAgent);
    const isChrome = /Chrome/.test(userAgent);
    const isSafari = /Safari/.test(userAgent) && !isChrome;
    const isFirefox = /Firefox/.test(userAgent);

    if (isIOS) {
      if (isSafari) {
        return {
          supported: true,
          instruction: "Tap the share button, then 'Add to Home Screen'"
        };
      } else {
        return {
          supported: false,
          instruction: "Sugar, you'll need to use Safari on iOS for this magic to work!"
        };
      }
    } else if (isAndroid) {
      if (isChrome) {
        return {
          supported: true,
          instruction: "Tap the three dots menu, then 'Add to Home Screen'"
        };
      } else if (isFirefox) {
        return {
          supported: false,
          instruction: "Honey, you'll need Chrome on Android for the best experience!"
        };
      }
    } else {
      // Desktop
      if (isChrome || userAgent.includes('Edge')) {
        return {
          supported: true,
          instruction: "Look for the install button (+) in your address bar"
        };
      } else {
        return {
          supported: false,
          instruction: "Darlin', please use Chrome or Edge for the full BookFairy experience!"
        };
      }
    }

    return {
      supported: false,
      instruction: "Well sugar, your browser might not support all our magic!"
    };
  };

  const renderStep = () => {
    switch (currentStep) {
      case 'welcome':
        return (
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
              
              {/* Continue button appears after first message completes */}
              <div className="text-center mt-6">
                <div className={`transition-all duration-500 ${showContent ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
                  <button 
                    onClick={() => setCurrentStep(user?.hardcoverApiKey ? 'fairy-disclaimer' : 'hardcover-api')}
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
                    Let's get started! ✨
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'hardcover-api':
        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message="First things first, sugar! I need your Hardcover API key to find all those delicious audiobooks for ya."
              mood="encouraging"
            />
            
            <div className="mt-6">
              <label className="block text-sm font-medium mb-2">
                Hardcover API Key
              </label>
              <input
                type="text"
                value={hardcoverKey}
                onChange={(e) => setHardcoverKey(e.target.value)}
                placeholder="Paste your API key here, darlin'"
                className="w-full p-3 rounded-lg border border-gray-300 bg-white/80"
              />
              <p className="text-xs mt-2 opacity-70">
                Get yours at <a href="https://hardcover.app" target="_blank" rel="noopener noreferrer" className="underline">hardcover.app</a>
              </p>
            </div>
            
            <button 
              onClick={handleHardcoverSubmit}
              className="fairy-button w-full mt-4"
            >
              Let's get started! ✨
            </button>
          </div>
        );

      case 'fairy-disclaimer':
        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message="Now sugar, to give you the full BookFairy experience, I need to install myself on your device and get permission to send you sweet little notifications. Don't worry, I'll walk you through every step!"
              mood="encouraging"
            />
            
            <button 
              onClick={() => setCurrentStep('device-choice')}
              className="fairy-button w-full mt-4"
            >
              I'm ready! Show me how ✨
            </button>
          </div>
        );

      case 'device-choice':
        const instructions = getBrowserInstructions();
        
        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message={`Alright honey, here's what you need to do: ${instructions.instruction}`}
              mood={instructions.supported ? "encouraging" : "sassy"}
            />
            
            {instructions.supported ? (
              <button 
                onClick={() => setCurrentStep('fairy-prep')}
                className="fairy-button w-full mt-4"
              >
                Got it! What's next? ✨
              </button>
            ) : (
              <div className="mt-4 text-center">
                <p className="text-sm opacity-70">
                  Please switch browsers and come back, sugar!
                </p>
              </div>
            )}
          </div>
        );

      case 'fairy-prep':
        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message="Perfect! Now darlin', when I flash ya that sparkly okay sign ✨👌, there's gonna be a pop-up askin' for permission. Just hit 'Allow' or 'Install' - that's how I become part of your magical library!"
              mood="encouraging"
            />
            
            <button 
              onClick={() => setCurrentStep('quiz')}
              className="fairy-button w-full mt-4"
            >
              I understand! ✨
            </button>
          </div>
        );

      case 'quiz':
        const quizOptions = [
          "Install this app as a PWA so I can send ya notifications.",
          "Download all the audiobooks to my phone right now.",
          "Share my reading list with everyone on social media.",
          "Sign up for a premium subscription service.",
          "Connect to my smart speaker and start reading aloud."
        ];

        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message={`Alright sugar, pop quiz time! When I flash ya that okay sign ✨👌, what did I tell ya to accept?`}
              mood="playful"
            />
            
            <div className="mt-6 space-y-3">
              {quizOptions.map((option, index) => (
                <button
                  key={index}
                  onClick={() => handleQuizAnswer(option)}
                  className="w-full p-3 text-left rounded-lg bg-white/50 hover:bg-white/70 transition-colors border border-white/30"
                >
                  {option}
                </button>
              ))}
            </div>
            
            {quizAttempts > 0 && (
              <p className="text-xs mt-3 text-center opacity-70">
                Attempts: {quizAttempts}
              </p>
            )}
          </div>
        );

      case 'pwa-install':
        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message="Mmhmm, just hit Allow or Install, sugar. That's how I keep ya posted on all your magical stories!"
              mood="magical"
            />
            
            {showMagicalFlash && (
              <div className="text-center my-4">
                <span className="text-6xl fairy-sparkle">✨👌</span>
              </div>
            )}
            
            <button 
              onClick={handlePWAInstall}
              className="pwa-install-button w-full mt-4"
            >
              Install BookFairy ✨
            </button>
          </div>
        );

      case 'push-request':
        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message="One more tiny step, darlin'! I need permission to send you those sweet notifications when your books are ready!"
              mood="encouraging"
            />
            
            <button 
              onClick={handlePushRequest}
              className="fairy-button w-full mt-4"
            >
              Allow Notifications ✨
            </button>
          </div>
        );

      case 'confirmation':
        return (
          <div className="fairy-card p-6">
            <BookFairy 
              message="Butter my biscuits, you did it! Welcome to the magical world of BookFairy, sugar! Your Audiobookshelf account is all set up and ready to go!"
              mood="magical"
            />
            
            <button 
              onClick={handleComplete}
              className="fairy-button w-full mt-4"
            >
              Enter the Library ✨
            </button>
          </div>
        );

      default:
        return null;
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
        {currentStep === 'welcome' ? (
          renderStep()
        ) : (
          <div className="max-w-md w-full">
            {/* Progress indicator */}
            <div className="mb-6">
              <div className="flex justify-center mb-2">
                <span className="fairy-sparkle text-2xl">🧚‍♀️</span>
              </div>
              <div className="text-center text-sm opacity-70">
                Setting up your magical experience...
              </div>
            </div>

            {renderStep()}

            {/* Skip option for testing */}
            <div className="text-center mt-4">
              <button 
                onClick={onComplete}
                className="text-xs opacity-50 hover:opacity-70"
              >
                Skip for now (testing only)
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}