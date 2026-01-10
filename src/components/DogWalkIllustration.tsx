import { useState } from 'react';

const DogWalkIllustration = () => {
  const [isRubbing, setIsRubbing] = useState(false);

  const handleDogClick = () => {
    setIsRubbing(true);
    setTimeout(() => setIsRubbing(false), 800);
  };

  return (
    <svg
      viewBox="0 0 400 200"
      className="w-full max-w-md"
      style={{ overflow: 'visible' }}
    >
      {/* Dog - clickable with rubbing animation */}
      <g
        onClick={handleDogClick}
        className="cursor-pointer"
        style={{
          transform: isRubbing ? 'translateY(0)' : 'translateY(0)',
          animation: isRubbing ? 'dogRub 0.1s ease-in-out 8' : 'none',
        }}
      >
        {/* Dog body - elongated dachshund style */}
        <ellipse
          cx="80"
          cy="120"
          rx="50"
          ry="18"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
        
        {/* Dog head */}
        <ellipse
          cx="25"
          cy="105"
          rx="20"
          ry="15"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
        
        {/* Dog snout */}
        <path
          d="M 5 108 Q -5 108 -5 115 Q -5 122 5 118"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
        
        {/* Dog ear */}
        <path
          d="M 35 95 Q 45 80 35 85"
          fill="none"
          stroke="black"
          strokeWidth="3"
        />
        
        {/* Dog eye */}
        <circle cx="18" cy="102" r="3" fill="black" />
        
        {/* Dog nose */}
        <circle cx="2" cy="110" r="3" fill="black" />
        
        {/* Dog front legs - running */}
        <path
          d="M 50 135 L 40 165"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 60 135 L 75 160"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Dog back legs - running */}
        <path
          d="M 110 135 L 100 165"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M 120 135 L 135 155"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Dog tail */}
        <path
          d="M 130 115 Q 145 100 140 120"
          fill="none"
          stroke="black"
          strokeWidth="3"
          strokeLinecap="round"
        />
        
        {/* Motion lines */}
        <path d="M -15 100 L -25 100" stroke="black" strokeWidth="2" />
        <path d="M -15 110 L -30 110" stroke="black" strokeWidth="2" />
        <path d="M -15 120 L -25 120" stroke="black" strokeWidth="2" />
      </g>

      {/* Leash */}
      <path
        d="M 130 110 Q 180 90 230 105"
        fill="none"
        stroke="black"
        strokeWidth="3"
      />

      {/* Person - flying behind */}
      <g>
        {/* Person head */}
        <circle cx="280" cy="80" r="25" fill="black" />
        
        {/* Person face (lighter area) */}
        <ellipse cx="268" cy="85" rx="12" ry="10" fill="white" />
        
        {/* Person eye */}
        <circle cx="265" cy="85" r="2" fill="black" />
        
        {/* Person nose */}
        <path
          d="M 258 90 L 252 95"
          fill="none"
          stroke="black"
          strokeWidth="2"
        />
        
        {/* Person body */}
        <ellipse cx="310" cy="100" rx="25" ry="15" fill="black" />
        
        {/* Person arm holding leash */}
        <path
          d="M 290 100 L 250 105 L 230 105"
          fill="none"
          stroke="black"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Person hand */}
        <circle cx="232" cy="105" r="6" fill="black" />
        
        {/* Person other arm flailing */}
        <path
          d="M 320 95 L 355 75"
          fill="none"
          stroke="black"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Person legs flying */}
        <path
          d="M 330 110 L 360 130"
          fill="none"
          stroke="black"
          strokeWidth="8"
          strokeLinecap="round"
        />
        <path
          d="M 325 115 L 350 145"
          fill="none"
          stroke="black"
          strokeWidth="8"
          strokeLinecap="round"
        />
        
        {/* Flying shoe */}
        <ellipse
          cx="365"
          cy="50"
          rx="12"
          ry="6"
          fill="black"
          transform="rotate(-30 365 50)"
        />
      </g>

      <style>{`
        @keyframes dogRub {
          0%, 100% { transform: translateX(0) rotate(0deg); }
          25% { transform: translateX(-3px) rotate(-2deg); }
          75% { transform: translateX(3px) rotate(2deg); }
        }
      `}</style>
    </svg>
  );
};

export default DogWalkIllustration;
