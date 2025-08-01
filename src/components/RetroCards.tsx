import React, { useState, useRef, useEffect } from "react";

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

  // Handle mobile Safari viewport height
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

      // For iOS Safari, use a smaller height to account for browser bars
      if (isIOS && isSafari) {
        // Subtract estimated status bar height for different iPhone models
        const statusBarHeight = height > 800 ? 47 : 44; // iPhone X+ vs older models
        const adjustedHeight = Math.min(height, window.screen.height * 0.85);
        setViewportHeight(adjustedHeight - statusBarHeight);
      } else {
        setViewportHeight(height);
      }
    };

    updateViewportHeight();
    window.addEventListener("resize", updateViewportHeight);
    window.addEventListener("orientationchange", updateViewportHeight);

    // Handle iOS viewport changes when browser bars appear/disappear
    window.addEventListener("scroll", updateViewportHeight);

    // Multiple timeouts for Safari's delayed viewport calculation
    setTimeout(updateViewportHeight, 100);
    setTimeout(updateViewportHeight, 500);
    setTimeout(updateViewportHeight, 1000);

    return () => {
      window.removeEventListener("resize", updateViewportHeight);
      window.removeEventListener("orientationchange", updateViewportHeight);
      window.removeEventListener("scroll", updateViewportHeight);
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

  const openCamera = () => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      alert(
        "📸 Kamera nicht verfügbar\n\nIhr Browser unterstützt keinen Kamerazugriff. Verwenden Sie einen modernen Browser wie Chrome, Firefox oder Safari.",
      );
      return;
    }

    navigator.mediaDevices
      .getUserMedia({ video: true })
      .then((stream) => {
        // Create video element and display camera
        const video = document.createElement("video");
        video.srcObject = stream;
        video.play();

        // For demo purposes, show success message
        alert(
          "📸 Kamera erfolgreich aktiviert!\n\nHier würde normalerweise die Kamera-App oder Foto-Funktion geöffnet werden.",
        );

        // Stop the stream
        stream.getTracks().forEach((track) => track.stop());
      })
      .catch((err) => {
        console.error("Error accessing camera:", err);

        let message = "📸 Kamera-Zugriff nicht möglich\n\n";

        if (
          err.name === "NotAllowedError" ||
          err.name === "PermissionDeniedError"
        ) {
          message +=
            "Die Kamera-Berechtigung wurde verweigert.\n\n" +
            "So aktivieren Sie die Kamera:\n" +
            "• Klicken Sie auf das Kamera-Symbol in der Adressleiste\n" +
            "• Wählen Sie 'Zulassen' für Kamera-Zugriff\n" +
            "• Laden Sie die Seite neu und versuchen Sie es erneut";
        } else if (
          err.name === "NotFoundError" ||
          err.name === "DevicesNotFoundError"
        ) {
          message +=
            "Keine Kamera gefunden.\n\n" +
            "Überprüfen Sie, ob eine Kamera angeschlossen ist.";
        } else if (
          err.name === "NotReadableError" ||
          err.name === "TrackStartError"
        ) {
          message +=
            "Die Kamera wird bereits von einer anderen App verwendet.\n\n" +
            "Schließen Sie andere Apps die die Kamera verwenden und versuchen Sie es erneut.";
        } else if (
          err.name === "OverconstrainedError" ||
          err.name === "ConstraintNotSatisfiedError"
        ) {
          message += "Kamera-Einstellungen werden nicht unterstützt.";
        } else if (err.name === "NotSupportedError") {
          message +=
            "Kamera-Zugriff wird nicht unterstützt.\n\n" +
            "Verwenden Sie HTTPS oder einen modernen Browser.";
        } else if (err.name === "AbortError") {
          message += "Kamera-Zugriff wurde abgebrochen.";
        } else {
          message +=
            "Unbekannter Fehler beim Kamera-Zugriff.\n\n" +
            "Versuchen Sie es später erneut oder verwenden Sie einen anderen Browser.";
        }

        alert(message);
      });
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

  const handleTouchStart = (e: React.TouchEvent) => {
    if (draggingMemoji) return;
    setIsDragging(true);
    setStartX(e.touches[0].clientX);
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (!isDragging || draggingMemoji) return;
    const currentX = e.touches[0].clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleTouchEnd = () => {
    if (!isDragging || draggingMemoji) return;
    setIsDragging(false);

    if (Math.abs(translateX) > 50) {
      if (translateX > 0 && currentCard > 0) {
        setCurrentCard(currentCard - 1);
      } else if (translateX < 0 && currentCard < totalCards - 1) {
        setCurrentCard(currentCard + 1);
      }
    }

    setTranslateX(0);
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (draggingMemoji) return;
    setIsDragging(true);
    setStartX(e.clientX);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDragging || draggingMemoji) return;
    const currentX = e.clientX;
    const diff = currentX - startX;
    setTranslateX(diff);
  };

  const handleMouseUp = () => {
    if (!isDragging || draggingMemoji) return;
    setIsDragging(false);

    if (Math.abs(translateX) > 50) {
      if (translateX > 0 && currentCard > 0) {
        setCurrentCard(currentCard - 1);
      } else if (translateX < 0 && currentCard < totalCards - 1) {
        setCurrentCard(currentCard + 1);
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
      setCurrentCard(currentCard - 1);
    } else if (direction === "next" && currentCard < totalCards - 1) {
      setCurrentCard(currentCard + 1);
    }
  };

  const renderCard = () => {
    switch (currentCard) {
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
        top: isMobile ? "0px" : "0px",
        left: 0,
        right: 0,
      }}
    >
      {/* Header - Full Width */}
      <div
        className="flex items-center gap-4 w-full px-4 pb-4"
        style={{ marginTop: isMobile ? "0px" : "0px" }}
      >
        <h1 className="retro-title">Retro Cards</h1>
        <div className="flex-1 text-right retro-body">
          {currentCard + 1} / {totalCards}
        </div>
      </div>

      {/* Card Content - Centered with max-width */}
      <div
        className="flex-1 flex items-stretch justify-center px-4"
        style={{ marginTop: isMobile ? "4px" : "0px" }}
      >
        <div
          className="w-full max-w-[500px] flex flex-col"
          ref={containerRef}
          onTouchStart={handleTouchStart}
          onTouchMove={handleTouchMove}
          onTouchEnd={handleTouchEnd}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          onMouseLeave={handleMouseUp}
          style={{
            transform: `translateX(${translateX}px)`,
            transition: isDragging ? "none" : "transform 0.3s ease",
          }}
        >
          <div className="flex-1 flex flex-col justify-center items-start gap-10 bg-retro-card-bg rounded-2xl p-8 relative">
            {renderCard()}

            {/* Navigation hint on first card */}
            {currentCard === 0 && (
              <div className="absolute bottom-8 left-8 right-8 text-center retro-body">
                Swipe um weiter zu navigieren
              </div>
            )}

            {/* Left navigation zone (32px wide) */}
            {currentCard > 0 && (
              <div
                onClick={() => navigateCard("prev")}
                className="absolute left-0 top-0 w-8 h-full cursor-pointer z-20"
                style={{ width: "32px" }}
              />
            )}

            {/* Right navigation zone (32px wide) */}
            {currentCard < totalCards - 1 && (
              <div
                onClick={() => navigateCard("next")}
                className="absolute right-0 top-0 w-8 h-full cursor-pointer z-20"
                style={{ width: "32px" }}
              />
            )}
          </div>
        </div>
      </div>

      {/* Footer - Full Width */}
      <div className="flex items-start gap-4 w-full px-4" style={{ paddingTop: "16px", paddingBottom: isMobile ? "0px" : "16px", marginBottom: isMobile ? "16px" : "0px" }}>
        <button
          onClick={openRelationshipByDesign}
          className="flex-1 retro-body text-left cursor-pointer"
        >
          Relationship by design
        </button>
        <button
          onClick={openFeedbackEmail}
          className="retro-body cursor-pointer"
        >
          Feedback geben
        </button>
      </div>
    </div>
  );
};

export default RetroCards;