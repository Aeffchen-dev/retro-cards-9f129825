import React, { useState, useRef, useEffect } from "react";

interface MemojisPosition {
  niklas: { x: number; y: number };
  jana: { x: number; y: number };
}

const RetroCards: React.FC = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [nextCard, setNextCard] = useState<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [startX, setStartX] = useState(0);
  const [translateX, setTranslateX] = useState(0);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for draggable memojis on health check cards
  const [memojisPositions, setMemojisPositions] = useState<
    Record<number, MemojisPosition>
  >({
    1: { niklas: { x: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280), y: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 64 : 120) : 64) }, jana: { x: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280), y: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 136 : 192) : 136) } },
    2: { niklas: { x: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280), y: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 64 : 120) : 64) }, jana: { x: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 248 : 380) : 280), y: (typeof window !== "undefined" ? (window.innerWidth <= 768 ? 136 : 192) : 136) } },
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
    niklas: "",
    jana: "",
  });

  const totalCards = 6;

  // Handle mobile Safari viewport height and card dimensions
  useEffect(() => {
    const updateViewportHeight = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      const isSafari = /^((?!chrome|android).)*safari/i.test(
        navigator.userAgent,
      );

      // Update mobile detection
      setIsMobile(width <= 768);

      // Calculate available height for cards - similar to friends app
      let availableHeight;
      if (isIOS && isSafari) {
        // For iOS Safari, account for dynamic viewport and browser bars
        const statusBarHeight = height > 800 ? 47 : 44;
        availableHeight = Math.min(height, window.screen.height * 0.85) - statusBarHeight;
      } else {
        availableHeight = height;
      }

      // Ensure minimum height for usability
      const minHeight = 600;
      setViewportHeight(Math.max(availableHeight, minHeight));
    };

    updateViewportHeight();
    
    // Set up event listeners for viewport changes
    const events = ['resize', 'orientationchange', 'scroll'];
    events.forEach(event => {
      window.addEventListener(event, updateViewportHeight);
    });

    // Handle iOS viewport changes with multiple timeouts for Safari's delayed calculation
    const timeouts = [100, 300, 500, 1000];
    const timeoutIds = timeouts.map(delay => 
      setTimeout(updateViewportHeight, delay)
    );

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, updateViewportHeight);
      });
      timeoutIds.forEach(id => clearTimeout(id));
    };
  }, []);

  // Add global event listeners for memoji dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingMemoji) return;

      const deltaX = e.clientX - draggingMemoji.startX;
      const deltaY = e.clientY - draggingMemoji.startY;

      const newX = Math.max(0, Math.min(370, draggingMemoji.initialX + deltaX));
      const newY = Math.max(
        -50,
        Math.min(isMobile ? 280 : 350, draggingMemoji.initialY + deltaY),
      );

      setMemojisPositions((prev) => ({
        ...prev,
        [draggingMemoji.cardIndex]: {
          ...prev[draggingMemoji.cardIndex],
          [draggingMemoji.person]: { x: newX, y: newY },
        },
      }));
    };

    const handleGlobalMouseUp = () => {
      setDraggingMemoji(null);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!draggingMemoji) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - draggingMemoji.startX;
      const deltaY = touch.clientY - draggingMemoji.startY;

      const newX = Math.max(0, Math.min(370, draggingMemoji.initialX + deltaX));
      const newY = Math.max(
        -50,
        Math.min(isMobile ? 280 : 350, draggingMemoji.initialY + deltaY),
      );

      setMemojisPositions((prev) => ({
        ...prev,
        [draggingMemoji.cardIndex]: {
          ...prev[draggingMemoji.cardIndex],
          [draggingMemoji.person]: { x: newX, y: newY },
        },
      }));
    };

    const handleGlobalTouchEnd = () => {
      setDraggingMemoji(null);
    };

    if (draggingMemoji) {
      document.addEventListener("mousemove", handleGlobalMouseMove);
      document.addEventListener("mouseup", handleGlobalMouseUp);
      document.addEventListener("touchmove", handleGlobalTouchMove);
      document.addEventListener("touchend", handleGlobalTouchEnd);
    }

    return () => {
      document.removeEventListener("mousemove", handleGlobalMouseMove);
      document.removeEventListener("mouseup", handleGlobalMouseUp);
      document.removeEventListener("touchmove", handleGlobalTouchMove);
      document.removeEventListener("touchend", handleGlobalTouchEnd);
    };
  }, [draggingMemoji]);

  const openCamera = async () => {
    console.log('Camera button clicked');
    console.log('User agent:', navigator.userAgent);
    console.log('Is secure context:', window.isSecureContext);
    console.log('Protocol:', window.location.protocol);
    console.log('Hostname:', window.location.hostname);
    
    const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
    
    console.log('Is iOS:', isIOS);
    console.log('Is Safari:', isSafari);
    
    // For iPhone, try the file input method first (most reliable)
    if (isIOS) {
      console.log('iPhone detected, using file input method');
      openCameraForIOS();
      return;
    }
    
    // Check if we're on HTTPS or localhost (required for camera access)
    const isSecureContext = window.isSecureContext || 
                           window.location.protocol === 'https:' || 
                           window.location.hostname === 'localhost' ||
                           window.location.hostname === '127.0.0.1';
    
    if (!isSecureContext) {
      console.log('Not a secure context, camera access denied');
      alert(
        "📸 Kamera-Zugriff nicht möglich\n\n" +
        "Kamera-Zugriff ist nur über HTTPS verfügbar.\n" +
        "Aktueller Protokoll: " + window.location.protocol
      );
      return;
    }

    // Check if mediaDevices API is available
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      console.log('MediaDevices API not available');
      openCameraForIOS(); // Fallback
      return;
    }

    try {
      console.log('Requesting camera permissions via getUserMedia...');
      
      const constraints = {
        video: {
          facingMode: 'user',
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      console.log('Camera access granted successfully');

      alert(
        "📸 Kamera erfolgreich aktiviert!\n\n" +
        "Kamera-Zugriff wurde gewährt."
      );

      // Clean up the stream
      stream.getTracks().forEach((track) => {
        track.stop();
        console.log('Camera track stopped');
      });

    } catch (err) {
      console.error("Error accessing camera via getUserMedia:", err);
      console.log('Falling back to file input method...');
      openCameraForIOS(); // Fallback for any error
    }
  };

  const openCameraForIOS = () => {
    console.log('Opening camera using file input method (iOS compatible)');
    
    try {
      // Create a hidden file input that opens camera on mobile devices
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = 'image/*';
      input.capture = 'user'; // Use front camera (selfie camera) by default
      input.style.position = 'fixed';
      input.style.top = '-1000px';
      input.style.left = '-1000px';
      input.style.opacity = '0';
      input.style.pointerEvents = 'none';
      
      console.log('File input created with attributes:', {
        type: input.type,
        accept: input.accept,
        capture: input.capture
      });
      
      input.onchange = (e) => {
        console.log('File input change event triggered');
        const target = e.target as HTMLInputElement;
        if (target.files && target.files[0]) {
          console.log('File selected:', target.files[0]);
          alert(
            "📸 Foto erfolgreich aufgenommen!\n\n" +
            "Das Foto wurde ausgewählt. Dateiname: " + target.files[0].name
          );
        } else {
          console.log('No file selected or user cancelled');
        }
        
        // Clean up
        if (document.body.contains(input)) {
          document.body.removeChild(input);
          console.log('File input removed from DOM');
        }
      };
      
      input.oncancel = () => {
        console.log('File input cancelled by user');
        if (document.body.contains(input)) {
          document.body.removeChild(input);
        }
      };
      
      // Add to DOM and trigger click
      document.body.appendChild(input);
      console.log('File input added to DOM, triggering click...');
      
      // Small delay to ensure DOM insertion
      setTimeout(() => {
        input.click();
        console.log('File input click triggered');
      }, 100);
      
    } catch (error) {
      console.error('Error in openCameraForIOS:', error);
      alert(
        "📸 Kamera-Zugriff nicht möglich\n\n" +
        "Es gab einen Fehler beim Öffnen der Kamera. " +
        "Fehler: " + error.message + "\n\n" +
        "Versuchen Sie es erneut oder prüfen Sie Ihre Browser-Einstellungen."
      );
    }
  };

  const openFeedbackEmail = () => {
    const email = "hello@relationshipbydesign.de";
    const subject = "Feedback Retro Cards";
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoUrl);
  };

  const openRelationshipByDesign = () => {
    window.open("https://relationshipbydesign.de/", "_blank");
  };
  const animateToCard = (targetCard: number) => {
    if (isTransitioning || targetCard === currentCard) return;
    
    setIsTransitioning(true);
    setNextCard(targetCard);
    
    // After animation completes, update current card
    setTimeout(() => {
      setCurrentCard(targetCard);
      setNextCard(null);
      setIsTransitioning(false);
    }, 600); // Match transition duration
  };

  const handleTouchStart = (e: React.TouchEvent) => {
    if (draggingMemoji || isTransitioning) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || draggingMemoji || isTransitioning) return;
    
    // Prevent default to avoid page scrolling during swipe
    e.preventDefault();
    
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    
    // Add resistance at boundaries for natural feel - like friends app
    let resistanceFactor = 1;
    if ((currentCard === 0 && diff > 0) || (currentCard === totalCards - 1 && diff < 0)) {
      resistanceFactor = 0.3; // Add resistance at boundaries
    }
    
    setTranslateX(diff * resistanceFactor);
  };

  const handleTouchEnd = () => {
    if (!isDragging || draggingMemoji || isTransitioning) return;
    setIsDragging(false);

    // Increased threshold for more deliberate swipes - like friends app
    const threshold = 80;
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentCard > 0) {
        // Swiping right (previous card)
        animateToCard(currentCard - 1);
      } else if (translateX < 0 && currentCard < totalCards - 1) {
        // Swiping left (next card)
        animateToCard(currentCard + 1);
      }
    }

    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggingMemoji || isTransitioning) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || draggingMemoji || isTransitioning) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    
    // Add resistance at boundaries for natural feel - like friends app
    let resistanceFactor = 1;
    if ((currentCard === 0 && diff > 0) || (currentCard === totalCards - 1 && diff < 0)) {
      resistanceFactor = 0.3;
    }
    
    setTranslateX(diff * resistanceFactor);
  };

  const handleMouseUp = () => {
    if (!isDragging || draggingMemoji || isTransitioning) return;
    setIsDragging(false);

    // Increased threshold for more deliberate swipes - like friends app
    const threshold = 80;
    if (Math.abs(translateX) > threshold) {
      if (translateX > 0 && currentCard > 0) {
        animateToCard(currentCard - 1);
      } else if (translateX < 0 && currentCard < totalCards - 1) {
        animateToCard(currentCard + 1);
      }
    }

    setTranslateX(0);
  };

  const handleMemojiMouseDown = (
    e: React.MouseEvent,
    cardIndex: number,
    person: "niklas" | "jana",
  ) => {
    e.stopPropagation();
    const currentPos = memojisPositions[cardIndex]?.[person];
    setDraggingMemoji({
      cardIndex,
      person,
      startX: e.clientX,
      startY: e.clientY,
      initialX: currentPos?.x || 380,
      initialY: currentPos?.y || 250,
    });
  };

  const handleMemojiTouchStart = (
    e: React.TouchEvent,
    cardIndex: number,
    person: "niklas" | "jana",
  ) => {
    e.stopPropagation();
    const touch = e.touches[0];
    const currentPos = memojisPositions[cardIndex]?.[person];
    setDraggingMemoji({
      cardIndex,
      person,
      startX: touch.clientX,
      startY: touch.clientY,
      initialX: currentPos?.x || 380,
      initialY: currentPos?.y || 250,
    });
  };

  const navigateCard = (direction: "prev" | "next") => {
    if (direction === "prev" && currentCard > 0) {
      animateToCard(currentCard - 1);
    } else if (direction === "next" && currentCard < totalCards - 1) {
      animateToCard(currentCard + 1);
    }
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
              <h2 className="retro-heading w-full">
                Schießt ein paar süße Fotos zusammen
              </h2>
            </div>
            <div style={{ marginTop: "40px" }}>
              <button
                onClick={openCamera}
                className="retro-emoji-large cursor-pointer"
              >
                📸
              </button>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="flex flex-col items-start w-full h-full">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Health Check</span>
              </div>
              <h2 className="retro-heading w-full">
                {isMobile ? "Wie geht's mir persönlich?" : "Wie geht's mir persönlich in letzter Zeit?"}
              </h2>
            </div>
            <div className="relative w-full flex-1 mt-10">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="text-4xl">🤩</div>
                <div className="text-4xl">🙂</div>
                <div className="text-4xl">🤨</div>
                <div className="text-4xl">🙁</div>
                <div className="text-4xl">😩</div>
              </div>
              {/* Draggable Memojis */}
              <div
                className="absolute w-14 h-14 cursor-move select-none touch-none"
                style={{
                  left: memojisPositions[1]?.niklas.x || (isMobile ? 248 : 380),
                  top: memojisPositions[1]?.niklas.y || (isMobile ? 64 : 120),
                  zIndex: 1000,
                }}
                onMouseDown={(e) => handleMemojiMouseDown(e, 1, "niklas")}
                onTouchStart={(e) => handleMemojiTouchStart(e, 1, "niklas")}
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/ee83edcf23407c8bac163d99b50bfcd0b1b0b81d?width=112"
                  alt="Niklas Memoji"
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                  draggable={false}
                />
              </div>
              <div
                className="absolute w-14 h-14 cursor-move select-none touch-none"
                style={{
                  left: memojisPositions[1]?.jana.x || (isMobile ? 248 : 380),
                  top: memojisPositions[1]?.jana.y || (isMobile ? 136 : 192),
                  zIndex: 1000,
                }}
                onMouseDown={(e) => handleMemojiMouseDown(e, 1, "jana")}
                onTouchStart={(e) => handleMemojiTouchStart(e, 1, "jana")}
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f28e6e9d768fbdf91d144e9718a2ccb61273f623?width=112"
                  alt="Jana Memoji"
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                  draggable={false}
                />
              </div>
            </div>
            <div className="w-full text-center retro-body mt-8">
              Platziert eure Memojis auf der Skala
            </div>
          </div>
        );

      case 2:
        return (
          <div className="flex flex-col items-start w-full h-full">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Health Check</span>
              </div>
              <h2 className="retro-heading w-full">
                Wie geht's mir in der Beziehung?
              </h2>
            </div>
            <div className="relative w-full flex-1 mt-10">
              <div className="flex flex-col items-start justify-between h-full">
                <div className="text-4xl">🤩</div>
                <div className="text-4xl">🙂</div>
                <div className="text-4xl">🤨</div>
                <div className="text-4xl">🙁</div>
                <div className="text-4xl">😩</div>
              </div>
              {/* Draggable Memojis */}
              <div
                className="absolute w-14 h-14 cursor-move select-none touch-none"
                style={{
                  left: memojisPositions[2]?.niklas.x || (isMobile ? 248 : 380),
                  top: memojisPositions[2]?.niklas.y || (isMobile ? 64 : 120),
                  zIndex: 1000,
                }}
                onMouseDown={(e) => handleMemojiMouseDown(e, 2, "niklas")}
                onTouchStart={(e) => handleMemojiTouchStart(e, 2, "niklas")}
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/ee83edcf23407c8bac163d99b50bfcd0b1b0b81d?width=112"
                  alt="Niklas Memoji"
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                  draggable={false}
                />
              </div>
              <div
                className="absolute w-14 h-14 cursor-move select-none touch-none"
                style={{
                  left: memojisPositions[2]?.jana.x || (isMobile ? 248 : 380),
                  top: memojisPositions[2]?.jana.y || (isMobile ? 136 : 192),
                  zIndex: 1000,
                }}
                onMouseDown={(e) => handleMemojiMouseDown(e, 2, "jana")}
                onTouchStart={(e) => handleMemojiTouchStart(e, 2, "jana")}
              >
                <img
                  src="https://cdn.builder.io/api/v1/image/assets/TEMP/f28e6e9d768fbdf91d144e9718a2ccb61273f623?width=112"
                  alt="Jana Memoji"
                  className="w-full h-full object-cover rounded-full pointer-events-none"
                  draggable={false}
                />
              </div>
            </div>
            <div className="w-full text-center retro-body mt-8">
              Platziert eure Memojis auf der Skala
            </div>
          </div>
        );

      case 3:
        return (
          <div className="flex flex-col items-start w-full h-full">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">The last 4 weeks</span>
              </div>
              <h2 className="retro-heading w-full">
                Wie waren die letzten 4 Wochen? Was war los?
              </h2>
            </div>
            <div className="flex flex-col gap-4 w-full flex-1 justify-end">
              <div className="retro-body">
                🏆&nbsp;&nbsp;&nbsp;Das habe(n) ich / wir richtig gerockt
              </div>
              <div className="retro-body">
                🥰&nbsp;&nbsp;&nbsp;Ein schöner Moment
              </div>
              <div className="retro-body">
                💡&nbsp;&nbsp;&nbsp;Das habe ich gelernt
              </div>
              <div className="retro-body">
                💥&nbsp;&nbsp;&nbsp;Das hat mich Kraft gekostet
              </div>
              <div className="retro-body">
                🧠&nbsp;&nbsp;&nbsp;Was beschäftigt mich grade?
              </div>
              <div className="retro-body">
                💬&nbsp;&nbsp;&nbsp; Die letzten 4 Wochen in einem Wort
              </div>
            </div>
          </div>
        );

      case 4:
        return (
          <div className="flex flex-col items-start w-full h-full">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">To talk about</span>
              </div>
              <h2 className="retro-heading w-full">
                Darüber möchte ich mit dir sprechen
              </h2>
            </div>
            <div className="flex flex-col flex-1 w-full justify-between gap-6 mt-10">
              <textarea
                value={postItTexts.niklas}
                onChange={(e) =>
                  setPostItTexts({ ...postItTexts, niklas: e.target.value })
                }
                className="w-full flex-1 p-4 bg-retro-post-it text-black border-none resize-none text-lg focus:outline-none"
                style={{
                  borderRadius: "0px",
                } as React.CSSProperties}
                placeholder="Niklas' Themen"
              />
              <textarea
                value={postItTexts.jana}
                onChange={(e) =>
                  setPostItTexts({ ...postItTexts, jana: e.target.value })
                }
                className="w-full flex-1 p-4 bg-retro-post-it text-black border-none resize-none text-lg focus:outline-none"
                style={{
                  borderRadius: "0px",
                } as React.CSSProperties}
                placeholder="Jana's Themen"
              />
            </div>
          </div>
        );

      case 5:
        return (
          <div className="flex flex-col items-start gap-14 w-full justify-center">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Offene Beziehung</span>
              </div>
              <h2 className="retro-heading w-full">Wie stehts mit Dates?</h2>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="bg-retro-black text-retro-white overflow-hidden select-none flex flex-col"
      style={{
        height: `${viewportHeight}px`,
        minHeight: `${viewportHeight}px`,
        maxHeight: `${viewportHeight}px`,
        overflowY: "hidden",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      {/* Header - Compact like friends app */}
      <div className="flex items-center gap-4 w-full px-4 py-3">
        <h1 className="retro-title">Retro Cards</h1>
        <div className="flex-1 text-right retro-body">
          {currentCard + 1} / {totalCards}
        </div>
      </div>

      {/* Card Content - Friends app style slide animation */}
      <div className="flex-1 flex items-center justify-center px-4 pb-4 relative overflow-hidden">
        <div
          className="w-full max-w-[500px] h-full flex flex-col relative"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
        >
          {/* Current Card */}
          <div 
            className="absolute inset-0 flex flex-col justify-center items-start gap-10 bg-retro-card-bg rounded-2xl p-8 shadow-2xl transition-all"
            style={{
              minHeight: `${Math.max(viewportHeight * 0.75, 500)}px`,
              transform: isTransitioning 
                ? `translateX(-100%)` 
                : `translateX(${translateX}px)`,
              transitionDuration: isDragging ? "0ms" : isTransitioning ? "600ms" : "0ms",
              transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
              opacity: isTransitioning ? 0 : 1,
            }}
          >
            {renderCard(currentCard)}

            {/* Navigation hint on first card */}
            {currentCard === 0 && !isTransitioning && (
              <div className="absolute bottom-8 left-8 right-8 text-center retro-body">
                Swipe um weiter zu navigieren
              </div>
            )}

            {/* Left navigation zone (32px wide) */}
            {currentCard > 0 && !isTransitioning && (
              <div
                onClick={() => navigateCard("prev")}
                className="absolute left-0 top-0 w-8 h-full cursor-pointer z-20"
                style={{ width: "32px" }}
              />
            )}

            {/* Right navigation zone (32px wide) */}
            {currentCard < totalCards - 1 && !isTransitioning && (
              <div
                onClick={() => navigateCard("next")}
                className="absolute right-0 top-0 w-8 h-full cursor-pointer z-20"
                style={{ width: "32px" }}
              />
            )}
          </div>

          {/* Next Card (slides in from right) */}
          {nextCard !== null && (
            <div 
              className="absolute inset-0 flex flex-col justify-center items-start gap-10 bg-retro-card-bg rounded-2xl p-8 shadow-2xl transition-all"
              style={{
                minHeight: `${Math.max(viewportHeight * 0.75, 500)}px`,
                transform: isTransitioning ? `translateX(0)` : `translateX(100%)`,
                transitionDuration: "600ms",
                transitionTimingFunction: "cubic-bezier(0.16, 1, 0.3, 1)",
                opacity: isTransitioning ? 1 : 0,
              }}
            >
              {renderCard(nextCard)}
            </div>
          )}
        </div>
      </div>

      {/* Footer - Compact like friends app */}
      <div className="flex items-center gap-4 w-full px-4 py-3">
        <button
          onClick={openRelationshipByDesign}
          className="flex-1 retro-body text-left cursor-pointer hover:opacity-80 transition-opacity"
        >
          Relationship by design
        </button>
        <button
          onClick={openFeedbackEmail}
          className="retro-body cursor-pointer hover:opacity-80 transition-opacity"
        >
          Feedback geben
        </button>
      </div>
    </div>
  );
};

export default RetroCards;