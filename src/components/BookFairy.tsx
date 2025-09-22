import React, { useState, useEffect } from 'react';
import { useTheme } from './ThemeProvider';

interface BookFairyProps {
  message: string;
  mood?: 'playful' | 'sassy' | 'encouraging' | 'magical';
  showAvatar?: boolean;
  className?: string;
}

export function BookFairy({ 
  message, 
  mood = 'playful', 
  showAvatar = true, 
  className = '' 
}: BookFairyProps) {
  const { theme } = useTheme();
  const [isAnimating, setIsAnimating] = useState(false);

  useEffect(() => {
    setIsAnimating(true);
    const timer = setTimeout(() => setIsAnimating(false), 500);
    return () => clearTimeout(timer);
  }, [message]);

  const getMoodEmoji = () => {
    switch (mood) {
      case 'sassy': return '😏';
      case 'encouraging': return '😊';
      case 'magical': return '✨';
      default: return '🧚‍♀️';
    }
  };

  const getSparkleAnimation = () => {
    return mood === 'magical' ? 'fairy-sparkle' : '';
  };

  return (
    <div className={`flex items-start gap-4 ${className}`}>
      {showAvatar && (
        <div className={`fairy-avatar fairy-glow ${isAnimating ? 'fairy-sparkle' : ''}`}>
          {getMoodEmoji()}
        </div>
      )}
      
      <div className={`speech-bubble ${isAnimating ? 'animate-bounce' : ''}`}>
        <p className="text-sm leading-relaxed">
          {message}
        </p>
        
        {mood === 'magical' && (
          <div className="flex justify-end mt-2">
            <span className={getSparkleAnimation()}>✨👌</span>
          </div>
        )}
      </div>
    </div>
  );
}

export function BookFairyMessages() {
  const greetings = [
    "Well hey there, sugar. Ready to unlock a world of stories?",
    "Honey, you're about to discover your new favorite escape!",
    "Well, well, well... look who's ready for some literary magic!",
    "Sweet as peach tea! Let's find you somethin' delightful to listen to."
  ];

  const downloadComplete = [
    "Mmhmm, your audiobook's waitin' safe in the library, darlin'.",
    "Well butter my biscuit, that book's ready for ya!",
    "Sugar, your story's all set and ready to whisk you away!",
    "That's what I'm talkin' about! Your book's ready to go, honey."
  ];

  const sassyResponses = [
    "Now sugar, that ain't quite right. Let's try that again, shall we?",
    "Bless your heart, but that's not what I was lookin' for, darlin'.",
    "Oh honey, you're sweet as pie, but that ain't the answer I need.",
    "Well aren't you precious, but let's give that another shot, sugar."
  ];

  const encouragingMessages = [
    "You're doin' just fine, sweetheart! Keep goin'!",
    "That's the spirit, sugar! You've got this!",
    "Well aren't you just the smartest little thing!",
    "Perfect, darlin'! You're a natural at this!"
  ];

  return {
    getRandomGreeting: () => greetings[Math.floor(Math.random() * greetings.length)],
    getRandomDownloadComplete: () => downloadComplete[Math.floor(Math.random() * downloadComplete.length)],
    getRandomSassyResponse: () => sassyResponses[Math.floor(Math.random() * sassyResponses.length)],
    getRandomEncouragement: () => encouragingMessages[Math.floor(Math.random() * encouragingMessages.length)]
  };
}