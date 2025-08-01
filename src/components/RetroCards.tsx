import React, { useState, useEffect } from "react";

interface MemojisPosition {
  niklas: { x: number; y: number };
  jana: { x: number; y: number };
}

const RetroCards: React.FC = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [isTransitioning, setIsTransitioning] = useState(false);

  // State for draggable memojis on health check cards
  const [memojisPositions, setMemojisPositions] = useState<Record<number, MemojisPosition>>({
    1: { niklas: { x: 380, y: 120 }, jana: { x: 380, y: 192 } },
    2: { niklas: { x: 380, y: 120 }, jana: { x: 380, y: 192 } },
  });

  const [draggingMemoji, setDraggingMemoji] = useState<{
    cardIndex: number;
    person: "niklas" | "jana";
    startX: number;
    startY: number;
    initialX: number;
    initialY: number;
  } | null>(null);

  const [viewportHeight, setViewportHeight] = useState(
    typeof window !== "undefined" ? window.innerHeight : 767,
  );

  const [isMobile, setIsMobile] = useState(
    typeof window !== "undefined" ? window.innerWidth <= 768 : false,
  );

  const [postItTexts, setPostItTexts] = useState({
    niklas: "",
    jana: "",
  });

  const totalCards = 6;

  // Handle viewport changes
  useEffect(() => {
    const updateViewportHeight = () => {
      setViewportHeight(window.innerHeight);
      setIsMobile(window.innerWidth <= 768);
    };

    updateViewportHeight();
    window.addEventListener('resize', updateViewportHeight);
    return () => window.removeEventListener('resize', updateViewportHeight);
  }, []);

  // Navigation functions like friends app
  const navigateCard = (direction: "prev" | "next") => {
    if (isTransitioning) return;
    
    let newIndex = currentCard;
    if (direction === "prev" && currentCard > 0) {
      newIndex = currentCard - 1;
    } else if (direction === "next" && currentCard < totalCards - 1) {
      newIndex = currentCard + 1;
    }
    
    if (newIndex !== currentCard) {
      setIsTransitioning(true);
      setCurrentCard(newIndex);
      setTimeout(() => setIsTransitioning(false), 600);
    }
  };

  // Touch handling for swipe navigation
  const [touchStart, setTouchStart] = useState<number | null>(null);
  const [touchEnd, setTouchEnd] = useState<number | null>(null);

  const onTouchStart = (e: React.TouchEvent) => {
    if (draggingMemoji) return;
    setTouchEnd(null);
    setTouchStart(e.targetTouches[0].clientX);
  };

  const onTouchMove = (e: React.TouchEvent) => {
    if (draggingMemoji) return;
    setTouchEnd(e.targetTouches[0].clientX);
  };

  const onTouchEnd = () => {
    if (draggingMemoji || !touchStart || !touchEnd) return;
    
    const distance = touchStart - touchEnd;
    const isLeftSwipe = distance > 50;
    const isRightSwipe = distance < -50;

    if (isLeftSwipe) navigateCard("next");
    else if (isRightSwipe) navigateCard("prev");
  };

  const openCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: { facingMode: 'user' } });
      alert("📸 Kamera erfolgreich aktiviert!");
      stream.getTracks().forEach(track => track.stop());
    } catch (err) {
      alert("📸 Kamera-Zugriff fehlgeschlagen");
    }
  };

  const openFeedbackEmail = () => {
    window.open(`mailto:hello@relationshipbydesign.de?subject=${encodeURIComponent('Feedback Retro Cards')}`);
  };

  const openRelationshipByDesign = () => {
    window.open("https://relationshipbydesign.de/", "_blank");
  };

  const renderCard = (cardIndex: number) => {
    switch (cardIndex) {
      case 0:
        return (
          <div className="flex flex-col items-start w-full">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Memory Time</span>
              </div>
              <h2 className="retro-heading w-full">Schießt ein paar süße Fotos zusammen</h2>
            </div>
            <div style={{ marginTop: "40px" }}>
              <button onClick={openCamera} className="retro-emoji-large cursor-pointer">📸</button>
            </div>
          </div>
        );
      default:
        return <div className="retro-heading">Card {cardIndex + 1}</div>;
    }
  };

  return (
    <div className="bg-retro-black text-retro-white overflow-hidden select-none flex flex-col" style={{ height: `${viewportHeight}px`, position: "fixed", top: 0, left: 0, right: 0, bottom: 0 }}>
      {/* Header */}
      <div className="flex items-center gap-4 w-full px-4 py-3">
        <h1 className="retro-title">Retro Cards</h1>
        <div className="flex-1 text-right retro-body">{currentCard + 1} / {totalCards}</div>
      </div>

      {/* Card Content with friends app style transition */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4">
        <div className="w-full max-w-[500px] h-full relative overflow-hidden">
          {/* Navigation zones like friends app */}
          <div className="absolute left-0 top-0 w-20 h-full z-10 cursor-pointer" onClick={() => navigateCard("prev")}></div>
          <div className="absolute right-0 top-0 w-20 h-full z-10 cursor-pointer" onClick={() => navigateCard("next")}></div>
          
          {/* Card container with transform transition exactly like friends app */}
          <div className="relative h-full w-full bg-retro-card-bg rounded-2xl shadow-2xl overflow-hidden select-none"
               style={{ minHeight: `${Math.max(viewportHeight * 0.75, 500)}px` }}
               onTouchStart={onTouchStart}
               onTouchMove={onTouchMove}
               onTouchEnd={onTouchEnd}>
            
            {/* Render all cards positioned horizontally */}
            {Array.from({ length: totalCards }, (_, index) => (
              <div key={index} className="absolute inset-0 h-full flex flex-col justify-center items-start gap-10 p-8 transition-transform duration-600 ease-out"
                   style={{ transform: `translateX(${(index - currentCard) * 85}vw)` }}>
                {renderCard(index)}
                {index === 0 && (
                  <div className="absolute bottom-8 left-8 right-8 text-center retro-body">
                    Swipe um weiter zu navigieren
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Footer */}
      <div className="flex items-center gap-4 w-full px-4 py-3">
        <button onClick={openRelationshipByDesign} className="flex-1 retro-body text-left cursor-pointer hover:opacity-80 transition-opacity">
          Relationship by design
        </button>
        <button onClick={openFeedbackEmail} className="retro-body cursor-pointer hover:opacity-80 transition-opacity">
          Feedback geben
        </button>
      </div>
    </div>
  );
};

export default RetroCards;