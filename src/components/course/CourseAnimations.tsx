
// This file contains the CSS for animations used in the CourseHero component
import React from 'react';

const CourseAnimations = () => {
  return (
    <style>
      {`
      @keyframes pulse {
        0%, 100% { transform: scaleY(1); opacity: 0.7; }
        50% { transform: scaleY(1.2); opacity: 1; }
      }
      .animate-pulse {
        animation: pulse 1.5s ease-in-out infinite;
      }
      
      .spinning-disc::before {
        content: '';
        position: absolute;
        width: 100%;
        height: 100%;
        border-radius: 50%;
        background: radial-gradient(circle at center, transparent 40%, rgba(255,255,255,0.1) 60%, transparent 70%);
      }
      `}
    </style>
  );
};

export default CourseAnimations;
