import React, { useState, useRef, useEffect } from "react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Memoji images from assets folder

interface MemojisPosition {
  niklas: { x: number; y: number };
  jana: { x: number; y: number };
}

const RetroCards: React.FC = () => {
  const [currentCard, setCurrentCard] = useState(0);
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
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

  // State for camera modal
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

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

      // Set proper drag boundaries based on card layout
      const newX = Math.max(0, Math.min(436, draggingMemoji.initialX + deltaX));
      const newY = Math.max(
        isMobile ? 10 : 0, // Top boundary: 0px on desktop
        Math.min(isMobile ? 420 : 440, draggingMemoji.initialY + deltaY), // Bottom boundary: within card
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
      // Re-enable swiper when memoji dragging ends
      if (swiperRef) {
        swiperRef.allowTouchMove = true;
      }
      setDraggingMemoji(null);
    };

    const handleGlobalTouchMove = (e: TouchEvent) => {
      if (!draggingMemoji) return;

      const touch = e.touches[0];
      const deltaX = touch.clientX - draggingMemoji.startX;
      const deltaY = touch.clientY - draggingMemoji.startY;

      // Set proper drag boundaries based on card layout
      const newX = Math.max(0, Math.min(436, draggingMemoji.initialX + deltaX));
      const newY = Math.max(
        isMobile ? 10 : 0, // Top boundary: 0px on desktop
        Math.min(isMobile ? 420 : 440, draggingMemoji.initialY + deltaY), // Bottom boundary: within card
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
      // Re-enable swiper when memoji dragging ends  
      if (swiperRef) {
        swiperRef.allowTouchMove = true;
      }
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
    const isMac = /Mac|Macintosh/.test(navigator.userAgent);
    const isChrome = /Chrome/.test(navigator.userAgent);
    const isSafari = /^((?!chrome|android).)*safari/i.test(navigator.userAgent) && !isChrome;
    
    console.log('Is iOS:', isIOS);
    console.log('Is Mac:', isMac);
    console.log('Is Chrome:', isChrome);
    console.log('Is Safari:', isSafari);
    
    // For iPhone, try the file input method first (most reliable)
    if (isIOS) {
      console.log('iPhone detected, using file input method');
      openCameraForIOS();
      return;
    }
    
    // For Mac Safari (not Chrome), use file input method as well (more reliable)
    if (isMac && isSafari && !isChrome) {
      console.log('Mac Safari detected, using file input method');
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

      // Create camera preview modal
      openCameraPreview(stream);

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

  const openCameraPreview = (stream: MediaStream) => {
    console.log('Opening camera preview with stream');
    setCameraStream(stream);
    
    // Set up video element when stream is available
    setTimeout(() => {
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        videoRef.current.play().catch(err => {
          console.error('Error playing video:', err);
        });
      }
    }, 100);
  };

  const closeCameraPreview = () => {
    console.log('Closing camera preview');
    if (cameraStream) {
      cameraStream.getTracks().forEach(track => {
        track.stop();
        console.log('Camera track stopped');
      });
      setCameraStream(null);
    }
  };

  const takePicture = () => {
    if (!videoRef.current || !cameraStream) return;

    const canvas = document.createElement('canvas');
    const context = canvas.getContext('2d');
    if (!context) return;

    // Set canvas dimensions to match video
    canvas.width = videoRef.current.videoWidth;
    canvas.height = videoRef.current.videoHeight;

    // Draw the video frame to canvas
    context.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);

    // Convert to blob and show success message
    canvas.toBlob((blob) => {
      if (blob) {
        console.log('Picture taken, blob size:', blob.size);
        alert(
          "📸 Foto erfolgreich aufgenommen!\n\n" +
          "Das Foto wurde erfolgreich erstellt."
        );
        closeCameraPreview();
      }
    }, 'image/jpeg', 0.8);
  };

  // Cleanup camera stream on unmount
  useEffect(() => {
    return () => {
      if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
      }
    };
  }, [cameraStream]);

  const openFeedbackEmail = () => {
    const email = "hello@relationshipbydesign.de";
    const subject = "Feedback Retro Cards";
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(subject)}`;
    window.open(mailtoUrl);
  };

  const openRelationshipByDesign = () => {
    window.open("https://relationshipbydesign.de/", "_blank");
  };

  const handleMemojiMouseDown = (
    e: React.MouseEvent,
    cardIndex: number,
    person: "niklas" | "jana",
  ) => {
    e.stopPropagation();
    e.preventDefault();
    
    // Disable swiper while dragging memoji
    if (swiperRef) {
      swiperRef.allowTouchMove = false;
    }
    
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
    e.preventDefault();
    
    // Disable swiper while dragging memoji
    if (swiperRef) {
      swiperRef.allowTouchMove = false;
    }
    
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
    if (!swiperRef) return;
    
    if (direction === "prev") {
      swiperRef.slidePrev();
    } else {
      swiperRef.slideNext();
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
                  src="/lovable-uploads/265b3d56-6631-4628-82ae-33e1c30e87ca.png"
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
                  src="/lovable-uploads/927f4bb3-7ec2-4772-84d6-b06b2151d173.png"
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
                  src="/lovable-uploads/265b3d56-6631-4628-82ae-33e1c30e87ca.png"
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
                  src="/lovable-uploads/927f4bb3-7ec2-4772-84d6-b06b2151d173.png"
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

      {/* Card Content - Swiper.js slide animation like friends app */}
      <div className="flex-1 flex items-center justify-center px-4 pb-1">
        <div className="w-full h-full">
           <Swiper
            modules={[Navigation, Pagination]}
            spaceBetween={0}
            slidesPerView={1}
            speed={500}
            onSwiper={setSwiperRef}
            onSlideChange={(swiper) => setCurrentCard(swiper.activeIndex)}
            allowTouchMove={!draggingMemoji}
            style={{ height: '100%', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
            // Friends app style smooth transition with easing
            effect="slide"
            resistance={true}
            resistanceRatio={0.3}
            touchStartPreventDefault={false}
            simulateTouch={true}
            watchSlidesProgress={true}
            centeredSlides={true}
            // Enhanced momentum and easing like friends app
            touchRatio={1}
            threshold={10}
            shortSwipes={true}
            longSwipes={true}
            longSwipesRatio={0.5}
            longSwipesMs={300}
          >
            {Array.from({ length: totalCards }, (_, index) => (
              <SwiperSlide key={index}>
                <div className="w-full h-full flex items-center justify-center px-4">
                  <div 
                    className="relative h-full w-full max-w-[500px] max-h-[780px] mx-auto flex flex-col justify-center items-start gap-10 bg-retro-card-bg rounded-2xl p-8 shadow-2xl"
                  >
                    {renderCard(index)}

                    {/* Navigation hint on first card */}
                    {index === 0 && (
                      <div className="absolute bottom-8 left-8 right-8 text-center retro-body">
                        Swipe um weiter zu navigieren
                      </div>
                    )}

                    {/* Left navigation zone (32px wide) */}
                    {index > 0 && (
                      <div
                        onClick={() => navigateCard("prev")}
                        className="absolute left-0 top-0 w-8 h-full cursor-pointer z-20"
                        style={{ width: "32px" }}
                      />
                    )}

                    {/* Right navigation zone (32px wide) */}
                    {index < totalCards - 1 && (
                      <div
                        onClick={() => navigateCard("next")}
                        className="absolute right-0 top-0 w-8 h-full cursor-pointer z-20"
                        style={{ width: "32px" }}
                      />
                    )}
                  </div>
                </div>
              </SwiperSlide>
            ))}
          </Swiper>
        </div>
      </div>

      {/* Footer - Compact like friends app */}
      <div className="flex items-center gap-4 w-full px-4 py-1">
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

      {/* Camera Preview Modal */}
      {cameraStream && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg overflow-hidden max-w-md w-full">
            <video
              ref={videoRef}
              autoPlay
              playsInline
              muted
              className="w-full aspect-video object-cover"
            />
            <div className="p-4 flex gap-3 justify-center">
              <button
                onClick={takePicture}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 transition-colors"
              >
                📸 Foto aufnehmen
              </button>
              <button
                onClick={closeCameraPreview}
                className="px-6 py-2 bg-gray-600 text-white rounded-lg font-medium hover:bg-gray-700 transition-colors"
              >
                ❌ Schließen
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default RetroCards;