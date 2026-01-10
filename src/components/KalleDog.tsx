import React from "react";

interface KalleDogProps {
  className?: string;
}

const KalleDog: React.FC<KalleDogProps> = ({ className = "" }) => {
  return (
    <svg
      viewBox="0 0 200 220"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Body */}
      <ellipse cx="100" cy="140" rx="55" ry="45" fill="white" stroke="black" strokeWidth="2" />
      
      {/* Back leg left */}
      <path
        d="M55 160 L45 200 Q45 210 55 210 L65 210 Q75 210 75 200 L70 170"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Back leg right */}
      <path
        d="M85 175 L80 200 Q80 210 90 210 L100 210 Q110 210 110 200 L105 175"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Front leg left */}
      <path
        d="M115 175 L115 200 Q115 210 125 210 L135 210 Q145 210 145 200 L145 175"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Front leg right */}
      <path
        d="M145 160 L155 200 Q155 210 165 210 L175 210 Q185 210 180 200 L165 165"
        fill="white"
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Tail */}
      <path
        d="M45 120 Q25 100 30 80 Q35 70 40 75"
        fill="none"
        stroke="black"
        strokeWidth="6"
        strokeLinecap="round"
      />
      
      {/* Neck */}
      <ellipse cx="155" cy="105" rx="25" ry="30" fill="white" stroke="black" strokeWidth="2" />
      
      {/* Head */}
      <ellipse cx="170" cy="65" rx="30" ry="28" fill="white" stroke="black" strokeWidth="2" />
      
      {/* Snout */}
      <ellipse cx="195" cy="70" rx="15" ry="12" fill="white" stroke="black" strokeWidth="2" />
      
      {/* Nose */}
      <ellipse cx="205" cy="68" rx="5" ry="4" fill="black" />
      
      {/* Mouth smile */}
      <path
        d="M185 78 Q195 85 200 80"
        fill="none"
        stroke="black"
        strokeWidth="2"
        strokeLinecap="round"
      />
      
      {/* Tongue */}
      <path
        d="M192 82 Q195 95 190 98 Q185 100 183 95 Q182 88 188 82"
        fill="#F5A0A0"
        stroke="#E88888"
        strokeWidth="1"
      />
      
      {/* Ear */}
      <ellipse cx="145" cy="45" rx="12" ry="22" fill="black" />
      
      {/* Star sunglasses - left star */}
      <path
        d="M158 55 L161 48 L164 55 L172 55 L166 60 L168 68 L161 63 L154 68 L156 60 L150 55 Z"
        fill="black"
      />
      
      {/* Star sunglasses - right star */}
      <path
        d="M175 55 L178 48 L181 55 L189 55 L183 60 L185 68 L178 63 L171 68 L173 60 L167 55 Z"
        fill="black"
      />
      
      {/* Sunglasses bridge */}
      <path
        d="M164 58 L175 58"
        stroke="black"
        strokeWidth="2"
      />
      
      {/* Body spots */}
      <ellipse cx="75" cy="125" rx="12" ry="10" fill="black" />
      <ellipse cx="110" cy="115" rx="8" ry="7" fill="black" />
      <ellipse cx="130" cy="140" rx="10" ry="8" fill="black" />
      <ellipse cx="85" cy="155" rx="6" ry="5" fill="black" />
      <ellipse cx="115" cy="160" rx="5" ry="4" fill="black" />
      <ellipse cx="60" cy="145" rx="4" ry="3" fill="black" />
      <ellipse cx="140" cy="120" rx="5" ry="4" fill="black" />
      <ellipse cx="95" cy="130" rx="4" ry="3" fill="black" />
      
      {/* Leg spots */}
      <ellipse cx="55" cy="190" rx="4" ry="3" fill="black" />
      <ellipse cx="95" cy="195" rx="3" ry="2" fill="black" />
      <ellipse cx="130" cy="190" rx="4" ry="3" fill="black" />
      <ellipse cx="165" cy="185" rx="3" ry="2" fill="black" />
      
      {/* Paw lines */}
      <path d="M52 207 L52 210" stroke="black" strokeWidth="1.5" />
      <path d="M58 207 L58 210" stroke="black" strokeWidth="1.5" />
      <path d="M64 207 L64 210" stroke="black" strokeWidth="1.5" />
      
      <path d="M87 207 L87 210" stroke="black" strokeWidth="1.5" />
      <path d="M93 207 L93 210" stroke="black" strokeWidth="1.5" />
      <path d="M99 207 L99 210" stroke="black" strokeWidth="1.5" />
      
      <path d="M122 207 L122 210" stroke="black" strokeWidth="1.5" />
      <path d="M128 207 L128 210" stroke="black" strokeWidth="1.5" />
      <path d="M134 207 L134 210" stroke="black" strokeWidth="1.5" />
      
      <path d="M162 207 L162 210" stroke="black" strokeWidth="1.5" />
      <path d="M168 207 L168 210" stroke="black" strokeWidth="1.5" />
      <path d="M174 207 L174 210" stroke="black" strokeWidth="1.5" />
    </svg>
  );
};

export default KalleDog;
