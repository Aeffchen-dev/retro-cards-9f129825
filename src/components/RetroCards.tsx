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
      niklas: { x: window.innerWidth <= 768 ? 248 : 380, y: window.innerWidth <= 768 ? 64 : 120 }, 
      jana: { x: window.innerWidth <= 768 ? 248 : 380, y: window.innerWidth <= 768 ? 136 : 192 } 
    },
    2: { 
      niklas: { x: window.innerWidth <= 768 ? 248 : 380, y: window.innerWidth <= 768 ? 64 : 120 }, 
      jana: { x: window.innerWidth <= 768 ? 248 : 380, y: window.innerWidth <= 768 ? 136 : 192 } 
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
  const [viewportHeight, setViewportHeight] = useState(window.innerHeight);

  // State for mobile detection
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

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

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const cards = [
    {
      id: 0,
      type: "intro",
      title: "Retro Cards",
      subtitle: "Interactive Team Health Check",
      content: "Swipe through the cards to explore team dynamics and health metrics.",
    },
    {
      id: 1,
      type: "health-check",
      title: "Team Collaboration",
      question: "How well does our team collaborate?",
      scale: "Poor → Excellent",
    },
    {
      id: 2,
      type: "health-check",
      title: "Work-Life Balance",
      question: "How balanced do you feel?",
      scale: "Burnout → Perfect Balance",
    },
    {
      id: 3,
      type: "summary",
      title: "Team Summary",
      content: "Thank you for participating in our team health check!",
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
  }, [draggingMemoji]);

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
          <div className="h-full bg-retro-card-bg rounded-3xl p-8 md:p-12 flex flex-col justify-center items-center text-center border border-retro-white/10">
            <h1 className="text-4xl md:text-6xl font-bold text-retro-white mb-4 font-inter">
              {card.title}
            </h1>
            <h2 className="text-xl md:text-2xl text-retro-white/80 mb-6">
              {card.subtitle}
            </h2>
            <p className="text-lg text-retro-white/60 max-w-md">
              {card.content}
            </p>
            <div className="mt-8 text-retro-white/40 text-sm">
              Swipe to continue →
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
          <div className="h-full bg-retro-card-bg rounded-3xl p-6 md:p-8 border border-retro-white/10 relative overflow-hidden">
            <div className="mb-6">
              <h2 className="text-2xl md:text-3xl font-bold text-retro-white mb-2 font-inter">
                {card.title}
              </h2>
              <p className="text-lg text-retro-white/80 mb-4">{card.question}</p>
              <div className="text-sm text-retro-white/60">{card.scale}</div>
            </div>

            {/* Health Check Scale */}
            <div className="mb-8">
              <div className="h-2 bg-retro-white/20 rounded-full mb-4">
                <div className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500 rounded-full"></div>
              </div>
              <div className="flex justify-between text-xs text-retro-white/60">
                <span>1</span>
                <span>2</span>
                <span>3</span>
                <span>4</span>
                <span>5</span>
              </div>
            </div>

            {/* Draggable Memojis */}
            {memojisPositions[card.id] && (
              <>
                <img
                  src={memojiNiklas}
                  alt="Niklas"
                  className="absolute w-12 h-12 cursor-grab active:cursor-grabbing select-none"
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
                  className="absolute w-12 h-12 cursor-grab active:cursor-grabbing select-none"
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
            <div className="absolute bottom-4 right-4 space-y-2">
              <div className="bg-retro-post-it p-2 rounded transform rotate-2 shadow-lg">
                <input
                  type="text"
                  value={postItTexts.niklas}
                  onChange={(e) => handlePostItChange("niklas", e.target.value)}
                  className="bg-transparent text-black text-sm font-medium outline-none w-16"
                  maxLength={12}
                />
              </div>
              <div className="bg-retro-post-it p-2 rounded transform -rotate-1 shadow-lg">
                <input
                  type="text"
                  value={postItTexts.jana}
                  onChange={(e) => handlePostItChange("jana", e.target.value)}
                  className="bg-transparent text-black text-sm font-medium outline-none w-16"
                  maxLength={12}
                />
              </div>
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
          <div className="h-full bg-retro-card-bg rounded-3xl p-8 md:p-12 flex flex-col justify-center items-center text-center border border-retro-white/10">
            <h2 className="text-3xl md:text-4xl font-bold text-retro-white mb-6 font-inter">
              {card.title}
            </h2>
            <p className="text-lg text-retro-white/80 mb-8 max-w-md">
              {card.content}
            </p>
            <button
              onClick={() => setCurrentCard(0)}
              className="px-6 py-3 bg-retro-white text-retro-black rounded-lg font-medium hover:bg-retro-white/90 transition-colors"
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
      className="min-h-screen bg-retro-black flex flex-col"
      style={{ height: `${viewportHeight}px` }}
    >
      {/* Header */}
      <div className="flex justify-between items-center p-4 md:p-6">
        <div className="text-retro-white font-inter font-bold text-lg">
          Retro Cards
        </div>
        <div className="flex space-x-2">
          {cards.map((_, index) => (
            <div
              key={index}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentCard ? "bg-retro-white" : "bg-retro-white/30"
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