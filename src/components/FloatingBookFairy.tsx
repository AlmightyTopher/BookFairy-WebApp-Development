import React, { useState, useEffect } from "react";
import { useTheme } from "./ThemeProvider";
import fairyCharacterImage from "figma:asset/162f942c140004a24aac627eed9ba511f26ce648.png";

interface FloatingBookFairyProps {
  onInteraction?: () => void;
}

export function FloatingBookFairy({
  onInteraction,
}: FloatingBookFairyProps) {
  const { theme } = useTheme();
  // Start fairy in safe center position
  const [position, setPosition] = useState({ x: 215, y: 200 });
  const [direction, setDirection] = useState({ x: 2, y: 1.5 });

  useEffect(() => {
    const interval = setInterval(() => {
      setPosition((currentPos) => {
        // Boundaries for mobile container (430px max-width)
        // Account for fairy size (128px width) and some padding
        const leftBound = 80;
        const rightBound = 350; // 430 - 80
        const topBound = 80;
        const bottomBound = window.innerHeight - 150;

        let newX = currentPos.x + direction.x;
        let newY = currentPos.y + direction.y;
        let newDirection = { ...direction };

        // Bounce off walls with proper boundary checks
        if (newX <= leftBound) {
          newX = leftBound;
          newDirection.x = Math.abs(direction.x); // Always positive after left wall
        } else if (newX >= rightBound) {
          newX = rightBound;
          newDirection.x = -Math.abs(direction.x); // Always negative after right wall
        }

        if (newY <= topBound) {
          newY = topBound;
          newDirection.y = Math.abs(direction.y); // Always positive after top wall
        } else if (newY >= bottomBound) {
          newY = bottomBound;
          newDirection.y = -Math.abs(direction.y); // Always negative after bottom wall
        }

        // Update direction if it changed
        if (newDirection.x !== direction.x || newDirection.y !== direction.y) {
          setDirection(newDirection);
        }

        return { x: newX, y: newY };
      });
    }, 50); // Smoother, more frequent updates

    return () => clearInterval(interval);
  }, [direction]);

  const handleClick = () => {
    onInteraction?.();

    const container = document.querySelector(".bookfairy-mobile-container");
    if (!container) return;

    // Create simple ✨ sparkles behind and on the fairy
    const numSparkles = 6;

    for (let i = 0; i < numSparkles; i++) {
      setTimeout(() => {
        const sparkle = document.createElement("div");
        sparkle.innerHTML = "✨";
        
        // Position sparkles behind and around the fairy
        const offsetX = (Math.random() - 0.5) * 80; // Closer to fairy
        const offsetY = (Math.random() - 0.5) * 80;
        
        sparkle.style.position = "absolute";
        sparkle.style.left = `${position.x + offsetX}px`;
        sparkle.style.top = `${position.y + offsetY}px`;
        sparkle.style.fontSize = "20px";
        sparkle.style.pointerEvents = "none";
        sparkle.style.zIndex = "45"; // Behind the fairy (fairy is z-50)
        sparkle.style.animation = "fairySparkle 2s ease-out forwards";

        container.appendChild(sparkle);
        
        setTimeout(() => {
          if (container.contains(sparkle)) {
            container.removeChild(sparkle);
          }
        }, 2000);
      }, i * 150); // Slower, more elegant timing
    }

    // Speed boost on click
    setDirection((prev) => ({
      x: prev.x * 2,
      y: prev.y * 2,
    }));

    // Reset speed after boost
    setTimeout(() => {
      setDirection((prev) => ({
        x: prev.x > 0 ? 2 : -2,
        y: prev.y > 0 ? 1.5 : -1.5,
      }));
    }, 1500);
  };

  return (
    <div
      onClick={handleClick}
      className="absolute z-50 cursor-pointer transition-all duration-200 hover:scale-110 active:scale-95"
      style={{
        left: `${position.x}px`,
        top: `${position.y}px`,
        transform: `translate(-50%, -50%) scaleX(${direction.x < 0 ? -1 : 1})`,
      }}
    >
      <img
        src={fairyCharacterImage}
        alt="BookFairy"
        className={`
          w-32 h-auto
          ${
            theme === "night"
              ? "drop-shadow-[0_0_20px_rgba(147,51,234,0.7)]"
              : "drop-shadow-[0_0_15px_rgba(255,215,0,0.6)]"
          }
        `}
        style={{
          animation: "fairyFloat 4s ease-in-out infinite",
        }}
      />
    </div>
  );
}