import React, { useState, useRef, useEffect } from "react";
import memojiNiklas from "@/assets/memoji-niklas.png";
import memojiJana from "@/assets/memoji-jana.png";

interface MemojisPosition {
  niklas: { x: number; y: number };
  jana: { x: number; y: number };
}

const RetroCards: React.FC = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for draggable memojis on health check cards
  const [memojisPositions, setMemojisPositions] = useState<
    Record<number, MemojisPosition>
  >({
    1: { 
      niklas: { x: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280, y: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 64 : 120) : 64 }, 
      jana: { x: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280, y: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 136 : 192) : 136 } 
    },
    2: { 
      niklas: { x: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280, y: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 64 : 120) : 64 }, 
      jana: { x: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280, y: typeof window !== "undefined" ? (window.innerWidth <= 768 ? 136 : 192) : 136 } 
    },
  });

  // State for memoji dragging
  const [draggingMemoji, setDraggingMemoji] = useState<{
    cardIndex: number;
    person: "niklas" | "jana";
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  // State for viewport height
  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 767,
  );

  // State for mobile detection
  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );

  // State for editable post-it notes
  const [postItTexts, setPostItTexts] = useState({
    niklas: "Niklas",
    jana: "Jana",
  });

  // Handle viewport resize
  useEffect(() => {
    const handleResize = () => {
      setViewportHeight(window.innerHeight);
      setIsMobile(window.innerWidth <= 768);
    };

    if (typeof window !== "undefined") {
      window.addEventListener("resize", handleResize);
      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);

  const cards = [
    {
      id: 0,
      type: "intro",
      title: "RETRO CARDS",
      subtitle: "Team Health Check",
      description: "A simple way to visualize team health and collaboration.",
    },
    {
      id: 1,
      type: "health-check",
      title: "Team Collaboration",
      question: "How well does our team collaborate?",
      scale: ["Poor", "Excellent"],
    },
    {
      id: 2,
      type: "health-check", 
      title: "Work-Life Balance",
      question: "How balanced do you feel?",
      scale: ["Burnout", "Perfect Balance"],
    },
    {
      id: 3,
      type: "summary",
      title: "Summary",
      content: "Thank you for participating in our team health check. Your feedback helps us improve our collaboration and work environment.",
    },
  ];

  // Touch and mouse event handlers for card swiping
  const handleStart = (e: React.TouchEvent | React.MouseEvent) => {
    setIsDragging(true);
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    setStartX(clientX);
  };

  const handleMove = (e: React.TouchEvent | React.MouseEvent) => {
    if (!isDragging) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const diff = clientX - startX;
    setTranslateX(diff);
  };

  const handleEnd = () => {
    if (!isDragging) return;
    setIsDragging(false);

    const threshold = 100;
    if (translateX > threshold && currentCard > 0) {
      setCurrentCard(currentCard - 1);
    } else if (translateX < -threshold && currentCard < cards.length - 1) {
      setCurrentCard(currentCard + 1);
    }
    
    setTranslateX(0);
  };

  // Memoji drag handlers
  const handleMemojiStart = (
    e: React.MouseEvent | React.TouchEvent,
    cardIndex: number,
    person: "niklas" | "jana"
  ) => {
    e.stopPropagation();
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    setDraggingMemoji({
      cardIndex,
      person,
      startX: clientX,
      startY: clientY,
      initialX: memojisPositions[cardIndex][person].x,
      initialY: memojisPositions[cardIndex][person].y,
    });
  };

  const handleMemojiMove = (e: React.MouseEvent | React.TouchEvent) => {
    if (!draggingMemoji) return;
    
    const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
    const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
    
    const deltaX = clientX - draggingMemoji.startX;
    const deltaY = clientY - draggingMemoji.startY;
    
    const newX = Math.max(0, Math.min(isMobile ? 280 : 420, draggingMemoji.initialX + deltaX));
    const newY = Math.max(0, Math.min(isMobile ? 200 : 280, draggingMemoji.initialY + deltaY));
    
    setMemojisPositions(prev => ({
      ...prev,
      [draggingMemoji.cardIndex]: {
        ...prev[draggingMemoji.cardIndex],
        [draggingMemoji.person]: { x: newX, y: newY }
      }
    }));
  };

  const handleMemojiEnd = () => {
    setDraggingMemoji(null);
  };

  // Global event listeners for memoji dragging
  useEffect(() => {
    if (draggingMemoji) {
      const handleMouseMove = (e: MouseEvent) => handleMemojiMove(e as any);
      const handleMouseUp = () => handleMemojiEnd();
      const handleTouchMove = (e: TouchEvent) => handleMemojiMove(e as any);
      const handleTouchEnd = () => handleMemojiEnd();

      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      document.addEventListener('touchmove', handleTouchMove);
      document.addEventListener('touchend', handleTouchEnd);

      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
        document.removeEventListener('touchmove', handleTouchMove);
        document.removeEventListener('touchend', handleTouchEnd);
      };
    }
  }, [draggingMemoji, isMobile]);

  const handlePostItChange = (person: "niklas" | "jana", text: string) => {
    setPostItTexts(prev => ({ ...prev, [person]: text }));
  };

  const renderCard = (card: any, index: number) => {
    const isActive = index === currentCard;
    const offset = (index - currentCard) * 100;
    const currentTranslate = isActive ? translateX : 0;

    if (card.type === "intro") {
      return (
        <div
          key={card.id}
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            isActive ? "" : "pointer-events-none"
          }`}
          style={{
            transform: `translateX(${offset + currentTranslate}px)`,
          }}
        >
          <div className="h-full bg-white rounded-2xl p-8 md:p-16 flex flex-col justify-center items-center text-center shadow-lg border border-gray-200">
            <h1 className="text-4xl md:text-6xl font-bold text-gray-900 mb-4 tracking-wide">
              {card.title}
            </h1>
            <h2 className="text-xl md:text-2xl text-gray-600 mb-8 font-medium">
              {card.subtitle}
            </h2>
            <p className="text-base md:text-lg text-gray-500 max-w-md leading-relaxed">
              {card.description}
            </p>
            <div className="mt-12 flex space-x-2">
              {cards.map((_, i) => (
                <div
                  key={i}
                  className={`w-2 h-2 rounded-full transition-colors ${
                    i === currentCard ? "bg-gray-900" : "bg-gray-300"
                  }`}
                />
              ))}
            </div>
          </div>
        </div>
      );
    }

    if (card.type === "health-check") {
      return (
        <div
          key={card.id}
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            isActive ? "" : "pointer-events-none"
          }`}
          style={{
            transform: `translateX(${offset + currentTranslate}px)`,
          }}
        >
          <div className="h-full bg-white rounded-2xl p-6 md:p-8 shadow-lg border border-gray-200 relative overflow-hidden">
            <div className="mb-8">
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-4">
                {card.title}
              </h2>
              <p className="text-lg text-gray-700 mb-6">{card.question}</p>
            </div>

            {/* Health Check Scale */}
            <div className="mb-8">
              <div className="h-3 bg-gray-200 rounded-full mb-4 relative overflow-hidden">
                <div className="h-full bg-gradient-to-r from-red-400 via-yellow-400 to-green-400 rounded-full"></div>
              </div>
              <div className="flex justify-between text-sm text-gray-600">
                <span>{card.scale[0]}</span>
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
                <span>{card.scale[1]}</span>
              </div>
            </div>

            {/* Draggable Memojis */}
            {memojisPositions[card.id] && (
              <>
                <img
                  src={memojiNiklas}
                  alt="Niklas"
                  className="absolute w-10 h-10 md:w-12 md:h-12 cursor-grab active:cursor-grabbing select-none rounded-full"
                  style={{
                    left: memojisPositions[card.id].niklas.x,
                    top: memojisPositions[card.id].niklas.y,
                    zIndex: draggingMemoji?.person === "niklas" ? 50 : 10,
                  }}
                  onMouseDown={(e) => handleMemojiStart(e, card.id, "niklas")}
                  onTouchStart={(e) => handleMemojiStart(e, card.id, "niklas")}
                  draggable={false}
                />
                <img
                  src={memojiJana}
                  alt="Jana"
                  className="absolute w-10 h-10 md:w-12 md:h-12 cursor-grab active:cursor-grabbing select-none rounded-full"
                  style={{
                    left: memojisPositions[card.id].jana.x,
                    top: memojisPositions[card.id].jana.y,
                    zIndex: draggingMemoji?.person === "jana" ? 50 : 10,
                  }}
                  onMouseDown={(e) => handleMemojiStart(e, card.id, "jana")}
                  onTouchStart={(e) => handleMemojiStart(e, card.id, "jana")}
                  draggable={false}
                />
              </>
            )}

            {/* Post-it Notes */}
            <div className="absolute bottom-4 right-4 space-y-3">
              <div className="bg-yellow-200 p-2 rounded-sm transform rotate-2 shadow-md border border-yellow-300">
                <input
                  type="text"
                  value={postItTexts.niklas}
                  onChange={(e) => handlePostItChange("niklas", e.target.value)}
                  className="bg-transparent text-gray-800 text-sm font-medium outline-none w-16 text-center"
                  maxLength={12}
                />
              </div>
              <div className="bg-yellow-200 p-2 rounded-sm transform -rotate-1 shadow-md border border-yellow-300">
                <input
                  type="text"
                  value={postItTexts.jana}
                  onChange={(e) => handlePostItChange("jana", e.target.value)}
                  className="bg-transparent text-gray-800 text-sm font-medium outline-none w-16 text-center"
                  maxLength={12}
                />
              </div>
            </div>

            {/* Navigation hint */}
            <div className="absolute bottom-4 left-4 text-gray-400 text-xs">
              Drag avatars on the scale
            </div>
          </div>
        </div>
      );
    }

    if (card.type === "summary") {
      return (
        <div
          key={card.id}
          className={`absolute inset-0 transition-transform duration-300 ease-out ${
            isActive ? "" : "pointer-events-none"
          }`}
          style={{
            transform: `translateX(${offset + currentTranslate}px)`,
          }}
        >
          <div className="h-full bg-white rounded-2xl p-8 md:p-16 flex flex-col justify-center items-center text-center shadow-lg border border-gray-200">
            <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-8">
              {card.title}
            </h2>
            <p className="text-base md:text-lg text-gray-600 mb-12 max-w-lg leading-relaxed">
              {card.content}
            </p>
            <button
              onClick={() => setCurrentCard(0)}
              className="px-8 py-3 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Start Over
            </button>
          </div>
        </div>
      );
    }
  };

  return (
    <div 
      className="min-h-screen bg-gray-50 flex flex-col"
      style={{ height: `${viewportHeight}px` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6">
        <div className="text-gray-900 font-bold text-lg">
          Retro Cards
        </div>
        <div className="flex space-x-2">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentCard ? "bg-gray-900" : "bg-gray-300"
              }`}
            />
          ))}
        </div>
      </div>

      {/* Cards Container */}
      <div className="flex-1 px-4 md:px-6 pb-6">
        <div
          ref={containerRef}
          className="relative h-full overflow-hidden"
          onMouseDown={handleStart}
          onMouseMove={handleMove}
          onMouseUp={handleEnd}
          onMouseLeave={handleEnd}
          onTouchStart={handleStart}
          onTouchMove={handleMove}
          onTouchEnd={handleEnd}
        >
          {cards.map((card, index) => renderCard(card, index))}
        </div>
      </div>
    </div>
  );
};

export default RetroCards;