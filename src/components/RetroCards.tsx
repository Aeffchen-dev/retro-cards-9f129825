import React, { useState, useRef, useEffect } from "react";
import { RefreshCw } from "lucide-react";
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import type { Swiper as SwiperType } from 'swiper';
import { saveToStorage, loadFromStorage, clearExpiredStorage, STORAGE_KEYS } from '@/lib/storage';
import kalleImage from '@/assets/kalle.png';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

// Memoji images from public assets folder
const niklasMemoji = "/assets/niklas-memoji.png";
const janaMemoji = "/assets/jana-memoji.png";

interface MemojisPosition {
  niklas: { x: number; y: number };
  jana: { x: number; y: number };
}

const RetroCards: React.FC = () => {
  // Initialize currentCard from localStorage synchronously for initialSlide
  const [currentCard, setCurrentCard] = useState(() => {
    const saved = loadFromStorage<number>(STORAGE_KEYS.CURRENT_CARD);
    return saved !== null ? saved : 0;
  });
  const [swiperRef, setSwiperRef] = useState<SwiperType | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // State for draggable memojis on health check cards - use lazy initialization
  const [memojisPositions, setMemojisPositions] = useState<
    Record<number, MemojisPosition>
  >(() => {
    const mobile = typeof window !== "undefined" && window.innerWidth <= 768;
    const x = mobile ? 248 : 380;
    const yNiklas = mobile ? 64 : 120;
    const yJana = mobile ? 136 : 192;
    return {
      1: { niklas: { x, y: yNiklas }, jana: { x, y: yJana } },
      2: { niklas: { x, y: yNiklas }, jana: { x, y: yJana } },
    };
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

  // State for viewport height - use lazy initialization
  const [viewportHeight, setViewportHeight] = useState(() =>
    typeof window !== "undefined" ? window.innerHeight : 767
  );

  // State for mobile detection - use lazy initialization
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== "undefined" && window.innerWidth <= 768
  );

  // State for editable post-it notes
  const [postItTexts, setPostItTexts] = useState({
    niklas: "",
    jana: "",
  });

  // State for takeaway post-it notes (Erkenntnisse)
  const [takeawayTexts, setTakeawayTexts] = useState({
    niklas: "",
    jana: "",
  });

  // State for random questions
  const [currentQuestion, setCurrentQuestion] = useState("");
  const [questionsLoaded, setQuestionsLoaded] = useState(false);
  const [allQuestions, setAllQuestions] = useState<string[]>([]);

  // State for camera modal
  const [cameraStream, setCameraStream] = useState<MediaStream | null>(null);
  const videoRef = useRef<HTMLVideoElement>(null);

  // State for Kalle speech bubble
  const [showKalleBubble, setShowKalleBubble] = useState(false);
  const [kalleBubbleMessage, setKalleBubbleMessage] = useState("Woof!");
  
  const dogMessages = [
    "Woof!",
    "Bark!",
    "Ruff!",
    "Arf arf!",
    "Wau wau!",
    "Yip yip!",
    "Bork!",
    "Howl!",
    "Treat?",
    "Pet me!",
  ];

  // Auto-hide Kalle speech bubble after 300ms
  useEffect(() => {
    if (showKalleBubble) {
      const timer = setTimeout(() => setShowKalleBubble(false), 600);
      return () => clearTimeout(timer);
    }
  }, [showKalleBubble]);

  const totalCards = 10;

  // Track if initial load is complete to avoid saving on mount
  const isInitialMount = useRef(true);

  // Load persisted state on mount - single batch to reduce re-renders
  useEffect(() => {
    // Defer cleanup to not block initial render
    if ('requestIdleCallback' in window) {
      (window as any).requestIdleCallback(() => clearExpiredStorage());
    } else {
      setTimeout(clearExpiredStorage, 500);
    }
    
    // Load all saved state at once
    const savedCurrentCard = loadFromStorage<number>(STORAGE_KEYS.CURRENT_CARD);
    const savedMemojiPositions = loadFromStorage<Record<number, MemojisPosition>>(STORAGE_KEYS.MEMOJI_POSITIONS);
    const savedPostItTexts = loadFromStorage<{niklas: string, jana: string}>(STORAGE_KEYS.POST_IT_TEXTS);
    const savedTakeawayTexts = loadFromStorage<{niklas: string, jana: string}>(STORAGE_KEYS.TAKEAWAY_TEXTS);
    const savedQuestion = loadFromStorage<string>(STORAGE_KEYS.CURRENT_QUESTION);
    
    // Batch state updates using unstable_batchedUpdates pattern
    // React 18 auto-batches, but we minimize by setting all at once
    if (savedCurrentCard !== null) setCurrentCard(savedCurrentCard);
    if (savedMemojiPositions !== null) setMemojisPositions(savedMemojiPositions);
    if (savedPostItTexts !== null) setPostItTexts(savedPostItTexts);
    if (savedTakeawayTexts !== null) setTakeawayTexts(savedTakeawayTexts);
    if (savedQuestion !== null) setCurrentQuestion(savedQuestion);
    
    // Mark initial mount complete after a tick
    requestAnimationFrame(() => {
      isInitialMount.current = false;
    });
  }, []);

  // Save state when it changes - skip initial mount
  useEffect(() => {
    if (isInitialMount.current) return;
    saveToStorage(STORAGE_KEYS.CURRENT_CARD, currentCard);
  }, [currentCard]);

  useEffect(() => {
    if (isInitialMount.current) return;
    saveToStorage(STORAGE_KEYS.MEMOJI_POSITIONS, memojisPositions);
  }, [memojisPositions]);

  useEffect(() => {
    if (isInitialMount.current) return;
    saveToStorage(STORAGE_KEYS.POST_IT_TEXTS, postItTexts);
  }, [postItTexts]);

  useEffect(() => {
    if (isInitialMount.current) return;
    saveToStorage(STORAGE_KEYS.TAKEAWAY_TEXTS, takeawayTexts);
  }, [takeawayTexts]);

  useEffect(() => {
    if (isInitialMount.current) return;
    if (currentQuestion) {
      saveToStorage(STORAGE_KEYS.CURRENT_QUESTION, currentQuestion);
    }
  }, [currentQuestion]);

  // Fetch questions from Google Sheets - truly non-blocking with cache
  useEffect(() => {
    const QUESTIONS_CACHE_KEY = 'retro-cards-questions-cache-v4';
    let hasCachedData = false;
    
    // Try to load cached questions immediately for fast initial render
    try {
      const cached = localStorage.getItem(QUESTIONS_CACHE_KEY);
      if (cached) {
        const { questions: cachedQuestions, timestamp } = JSON.parse(cached);
        const oneHour = 60 * 60 * 1000;
        if (Date.now() - timestamp < oneHour && cachedQuestions.length > 0) {
          setAllQuestions(cachedQuestions);
          setQuestionsLoaded(true);
          hasCachedData = true;
          
          // Set random question if none saved
          const savedQuestion = loadFromStorage<string>(STORAGE_KEYS.CURRENT_QUESTION);
          if (!savedQuestion) {
            const randomIndex = Math.floor(Math.random() * cachedQuestions.length);
            setCurrentQuestion(cachedQuestions[randomIndex]);
          }
          // If we have valid cache, don't fetch at all during initial load
          return;
        }
      }
    } catch (e) {
      console.warn('Failed to load cached questions');
    }
    
    // Only fetch if no valid cache - delay significantly to not block initial interaction
    const fetchQuestions = async () => {
      const sheetIds = [
        '1-BHUX8Zm4C2tACRJugpF_fj8TzBXnGGGUYQV3ggfKYM',
        '1ROCLsLu2rSJKRwkX5DkZHLHKzy_bksmHbgGqORG2DOk'
      ];
      
      const questions: string[] = [];
      const checkInRouletteId = '1ROCLsLu2rSJKRwkX5DkZHLHKzy_bksmHbgGqORG2DOk';
      
      // Fetch sheets sequentially to avoid network congestion blocking main thread
      for (const sheetId of sheetIds) {
        try {
          const url = `https://docs.google.com/spreadsheets/d/${sheetId}/export?format=csv`;
          const response = await fetch(url);
          const text = await response.text();
          
          // Yield to main thread before parsing
          await new Promise(resolve => setTimeout(resolve, 0));
          
          // Parse CSV - split by newlines and get second column (question)
          let rows = text.split('\n').filter(row => row.trim());
          
          // Skip first row (header) for both sheets
          if (rows.length > 0) {
            rows = rows.slice(1);
          }
          
          rows.forEach(row => {
            // Parse CSV columns - handle quoted values
            const columns = row.match(/("([^"]*("")*)*"|[^,]*)(,|$)/g);
            if (columns && columns.length >= 2) {
              // Get first column (category) and check if it's "intro"
              const firstCol = columns[0]?.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim().toLowerCase();
              
              // Skip intro category questions
              if (firstCol === 'intro') {
                return;
              }
              
              // Get second column (index 1), remove trailing comma and quotes
              const secondCol = columns[1]?.replace(/,$/, '').replace(/^"|"$/g, '').replace(/""/g, '"').trim();
              
              // Skip one-word questions
              const wordCount = secondCol?.split(/\s+/).filter(word => word.length > 0).length || 0;
              if (secondCol && secondCol.length > 0 && wordCount > 1) {
                questions.push(secondCol);
              }
            }
          });
        } catch (error) {
          console.warn('Failed to fetch questions from sheet:', sheetId, error);
        }
      }
      
      if (questions.length > 0) {
        // Cache the questions
        try {
          localStorage.setItem(QUESTIONS_CACHE_KEY, JSON.stringify({
            questions,
            timestamp: Date.now()
          }));
        } catch (e) {
          console.warn('Failed to cache questions');
        }
        
        setAllQuestions(questions);
        setQuestionsLoaded(true);
        
        // If no saved question and no current question, pick a random one
        const savedQuestion = loadFromStorage<string>(STORAGE_KEYS.CURRENT_QUESTION);
        if (!savedQuestion && questions.length > 0) {
          const randomIndex = Math.floor(Math.random() * questions.length);
          setCurrentQuestion(questions[randomIndex]);
        }
      }
    };
    
    // Wait 2 seconds after page load before fetching to ensure UI is interactive
    const timeoutId = setTimeout(fetchQuestions, 2000);
    return () => clearTimeout(timeoutId);
  }, []);

  const getRandomQuestion = () => {
    if (allQuestions.length === 0) return;
    const randomIndex = Math.floor(Math.random() * allQuestions.length);
    setCurrentQuestion(allQuestions[randomIndex]);
  };

  // Handle mobile Safari viewport height and card dimensions - debounced
  useEffect(() => {
    let rafId: number;
    
    const updateViewportHeight = () => {
      const height = window.innerHeight;
      const width = window.innerWidth;

      // Update mobile detection
      setIsMobile(width <= 768);

      // Calculate available height for cards - simplified for speed
      const isIOS = /iPad|iPhone|iPod/.test(navigator.userAgent);
      let availableHeight = height;
      
      if (isIOS && window.visualViewport) {
        availableHeight = window.visualViewport.height;
      }

      // Ensure minimum height for usability
      setViewportHeight(Math.max(availableHeight, 600));
    };

    // Run immediately
    updateViewportHeight();
    
    // Debounced handler for events
    const handleResize = () => {
      cancelAnimationFrame(rafId);
      rafId = requestAnimationFrame(updateViewportHeight);
    };
    
    window.addEventListener('resize', handleResize);
    window.addEventListener('orientationchange', handleResize);

    // Single delayed call for iOS Safari initial calculation
    const timeoutId = setTimeout(updateViewportHeight, 100);

    return () => {
      window.removeEventListener('resize', handleResize);
      window.removeEventListener('orientationchange', handleResize);
      cancelAnimationFrame(rafId);
      clearTimeout(timeoutId);
    };
  }, []);

  // Add global event listeners for memoji dragging
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!draggingMemoji) return;

      const deltaX = e.clientX - draggingMemoji.startX;
      const deltaY = e.clientY - draggingMemoji.startY;

      // Boundaries relative to the memoji container - keep within card bounds
      const containerWidth = isMobile ? 320 : 480; // Width of the draggable area
      const containerHeight = isMobile ? 300 : 520; // Increased desktop height to allow dragging closer to instruction text
      
      const newX = Math.max(0, Math.min(containerWidth - 56, draggingMemoji.initialX + deltaX)); // 56px = memoji width
      const newY = Math.max(-40, Math.min(containerHeight - 56, draggingMemoji.initialY + deltaY)); // -40px allows dragging into mt-10 space

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

      // Boundaries relative to the memoji container - keep within card bounds
      const containerWidth = isMobile ? 320 : 480; // Width of the draggable area
      const containerHeight = isMobile ? 300 : 520; // Increased desktop height to allow dragging closer to instruction text
      
      
      const newX = Math.max(0, Math.min(containerWidth - 56, draggingMemoji.initialX + deltaX)); // 56px = memoji width
      const newY = Math.max(-40, Math.min(containerHeight - 56, draggingMemoji.initialY + deltaY)); // -40px allows dragging into mt-10 space

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
                  src={niklasMemoji}
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
                  src={janaMemoji}
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
                  src={niklasMemoji}
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
                  src={janaMemoji}
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
                onBlur={() => {
                  // Fix iOS viewport restoration after keyboard close
                  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    setTimeout(() => {
                      // Force viewport to recalculate instead of scrolling to top
                      const currentHeight = window.innerHeight;
                      setViewportHeight(currentHeight);
                      // Trigger a gentle reflow without scrolling
                      document.body.style.height = `${currentHeight}px`;
                      requestAnimationFrame(() => {
                        document.body.style.height = '';
                      });
                    }, 150);
                  }
                }}
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
                onBlur={() => {
                  // Fix iOS viewport restoration after keyboard close
                  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    setTimeout(() => {
                      // Force viewport to recalculate instead of scrolling to top
                      const currentHeight = window.innerHeight;
                      setViewportHeight(currentHeight);
                      // Trigger a gentle reflow without scrolling
                      document.body.style.height = `${currentHeight}px`;
                      requestAnimationFrame(() => {
                        document.body.style.height = '';
                      });
                    }, 150);
                  }
                }}
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

      case 6:
        return (
          <div className="flex flex-col items-start w-full h-full relative">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Kalle</span>
              </div>
              <h2 className="retro-heading w-full">
                Wie läufts mit Kalle?
              </h2>
            </div>
            <div className="absolute bottom-0 left-0 flex flex-col gap-4 pb-0">
              <div className="retro-body text-white">Was war schön?</div>
              <div className="retro-body text-white">Was war anstrengend?</div>
              <div className="retro-body text-white">Entlasten wir uns gegenseitig?</div>
              <div className="retro-body text-white">Nehmen wir Hilfe an?</div>
              <div className="retro-body text-white">Welche Fortschritte gab es?</div>
              <div className="retro-body text-white">Was sollten wir noch angehen?</div>
            </div>
            <div className="absolute top-1/2 -translate-y-[calc(50%+24px)] right-0 -mr-4 md:-mr-6">
              <div className="relative cursor-pointer" onClick={() => {
                const randomMessage = dogMessages[Math.floor(Math.random() * dogMessages.length)];
                setKalleBubbleMessage(randomMessage);
                setShowKalleBubble(!showKalleBubble);
              }}>
                {showKalleBubble && (
                  <div className="absolute top-[20px] right-[calc(50%+88px)] bg-black text-white px-3 py-1.5 rounded-[16px] whitespace-nowrap text-sm animate-bubble-pop">
                    <span className="font-bold">{kalleBubbleMessage}</span>
                    <div className="absolute top-1/2 -translate-y-1/2 -right-[6px] w-0 h-0 border-t-[6px] border-b-[6px] border-l-[6px] border-t-transparent border-b-transparent border-l-black"></div>
                  </div>
                )}
                <img 
                  src={kalleImage} 
                  alt="Kalle" 
                  className={`max-h-[200px] md:max-h-[264px] object-contain transition-transform duration-300 ease-out hover:scale-105 active:scale-95 ${showKalleBubble ? 'animate-[wiggle_0.5s_ease-in-out]' : ''}`}
                  style={{ transform: 'scaleX(-1)' }}
                />
              </div>
            </div>
          </div>
        );

      case 7:
        return (
          <div className="flex flex-col items-start gap-14 w-full justify-center">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Intimität</span>
              </div>
              <h2 className="retro-heading w-full">Sind wir uns körperlich nah?</h2>
            </div>
          </div>
        );

      case 8:
        return (
          <div className="flex flex-col items-start w-full h-full">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Takeaways</span>
              </div>
              <h2 className="retro-heading w-full">
                Das nehmen wir aus der Retro mit
              </h2>
            </div>
            <div className="flex flex-col flex-1 w-full justify-between gap-6 mt-10">
              <textarea
                value={takeawayTexts.niklas}
                onChange={(e) =>
                  setTakeawayTexts({ ...takeawayTexts, niklas: e.target.value })
                }
                onBlur={() => {
                  // Fix iOS viewport restoration after keyboard close
                  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    setTimeout(() => {
                      // Force viewport to recalculate instead of scrolling to top
                      const currentHeight = window.innerHeight;
                      setViewportHeight(currentHeight);
                      // Trigger a gentle reflow without scrolling
                      document.body.style.height = `${currentHeight}px`;
                      requestAnimationFrame(() => {
                        document.body.style.height = '';
                      });
                    }, 150);
                  }
                }}
                className="w-full flex-1 p-4 bg-retro-post-it text-black border-none resize-none text-lg focus:outline-none"
                style={{
                  borderRadius: "0px",
                } as React.CSSProperties}
                placeholder="Niklas' Erkenntnisse"
              />
              <textarea
                value={takeawayTexts.jana}
                onChange={(e) =>
                  setTakeawayTexts({ ...takeawayTexts, jana: e.target.value })
                }
                onBlur={() => {
                  // Fix iOS viewport restoration after keyboard close
                  if (/iPad|iPhone|iPod/.test(navigator.userAgent)) {
                    setTimeout(() => {
                      // Force viewport to recalculate instead of scrolling to top
                      const currentHeight = window.innerHeight;
                      setViewportHeight(currentHeight);
                      // Trigger a gentle reflow without scrolling
                      document.body.style.height = `${currentHeight}px`;
                      requestAnimationFrame(() => {
                        document.body.style.height = '';
                      });
                    }, 150);
                  }
                }}
                className="w-full flex-1 p-4 bg-retro-post-it text-black border-none resize-none text-lg focus:outline-none"
                style={{
                  borderRadius: "0px",
                } as React.CSSProperties}
                placeholder="Jana's Erkenntnisse"
              />
            </div>
          </div>
        );

      case 9:
        return (
          <div className="flex flex-col items-start w-full h-full">
            <div className="flex flex-col items-start gap-6 w-full">
              <div className="flex py-1 px-3 justify-center items-center gap-2 rounded-full border border-retro-white">
                <span className="retro-label">Questions</span>
              </div>
              <h2 className="retro-heading w-full">
                {questionsLoaded && currentQuestion ? currentQuestion : "Frage wird geladen..."}
              </h2>
            </div>
            <div className="flex-1 flex items-end justify-center w-full">
              <div
                onClick={getRandomQuestion}
                className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
              >
                <RefreshCw size={20} className="text-retro-white" />
                <span className="retro-body">Neue Frage</span>
              </div>
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
            initialSlide={currentCard}
            onSwiper={setSwiperRef}
            onSlideChange={(swiper) => setCurrentCard(swiper.activeIndex)}
            allowTouchMove={!draggingMemoji}
            style={{ height: '100%', width: '100vw', marginLeft: 'calc(-50vw + 50%)' }}
            effect="slide"
            resistance={true}
            resistanceRatio={0.3}
            touchStartPreventDefault={false}
            centeredSlides={true}
            threshold={5}
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

      {/* Footer - Same margin as header for consistency */}
      <div className={`flex items-center gap-4 w-full px-4 ${isMobile ? 'py-3' : 'py-3'}`}>
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