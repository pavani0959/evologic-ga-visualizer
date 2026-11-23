import React from 'react';

export function BrandLogo({ className = 'w-7 h-7' }) {
  return (
    <div className={`relative flex items-center justify-center shrink-0 ${className}`}>
      <svg
        viewBox="0 0 36 36"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        className="w-full h-full drop-shadow-sm"
      >
        {/* Outer subtle shield / hex container */}
        <rect width="36" height="36" rx="9" fill="#161b22" stroke="#30363d" strokeWidth="1.5" />

        {/* Primary Helix Strand (Blue) */}
        <path
          d="M 9 27 C 9 17, 18 19, 18 9 C 18 19, 27 17, 27 27"
          stroke="#58a6ff"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Intersecting Helix Strand (Green) */}
        <path
          d="M 27 9 C 27 19, 18 17, 18 27 C 18 17, 9 19, 9 9"
          stroke="#3fb950"
          strokeWidth="2.5"
          strokeLinecap="round"
          strokeLinejoin="round"
        />

        {/* Gene base rungs */}
        <line x1="13" y1="13" x2="23" y2="13" stroke="#f0f6fc" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />
        <line x1="13" y1="23" x2="23" y2="23" stroke="#f0f6fc" strokeWidth="1.5" strokeLinecap="round" strokeDasharray="1 2" />

        {/* Central Optimization Champion Node */}
        <circle cx="18" cy="18" r="3" fill="#d29922" stroke="#ffffff" strokeWidth="1.5" />
      </svg>
    </div>
  );
}

