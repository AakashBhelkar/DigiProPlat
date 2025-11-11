import React from 'react';
import Box from '@mui/material/Box';

interface LoginIllustrationProps {
  width?: number | string;
  height?: number | string;
  sx?: object;
}

export function LoginIllustration({ width = '100%', height = 'auto', sx }: LoginIllustrationProps) {
  return (
    <Box
      component="svg"
      viewBox="0 0 800 600"
      width={width}
      height={height}
      sx={{
        maxWidth: '100%',
        height: 'auto',
        ...sx,
      }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="bgGradient" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#F8FAFC" stopOpacity="1" />
          <stop offset="100%" stopColor="#E5E7EB" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="personGradient" x1="0%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="#1a1f3a" stopOpacity="1" />
          <stop offset="100%" stopColor="#2d3550" stopOpacity="1" />
        </linearGradient>
      </defs>
      
      {/* Background */}
      <rect width="800" height="600" fill="url(#bgGradient)" />
      
      {/* Decorative Circles */}
      <circle cx="100" cy="100" r="60" fill="#1a1f3a" opacity="0.05" />
      <circle cx="700" cy="500" r="80" fill="#1a1f3a" opacity="0.05" />
      <circle cx="650" cy="100" r="40" fill="#1a1f3a" opacity="0.08" />
      
      {/* Main Illustration - Person with Security/Login Theme */}
      <g transform="translate(400, 350)">
        {/* Person Shadow */}
        <ellipse cx="0" cy="180" rx="80" ry="20" fill="#1a1f3a" opacity="0.1" />
        
        {/* Person Body */}
        <g>
          {/* Head */}
          <circle cx="0" cy="-80" r="50" fill="#FFD700" />
          <circle cx="-15" cy="-90" r="8" fill="#1a1f3a" />
          <circle cx="15" cy="-90" r="8" fill="#1a1f3a" />
          <path
            d="M -20 -70 Q 0 -60 20 -70"
            stroke="#1a1f3a"
            strokeWidth="2.5"
            fill="none"
            strokeLinecap="round"
          />
          
          {/* Hair/Head Detail */}
          <path
            d="M -45 -80 Q -35 -100 -25 -95 Q -15 -100 -5 -95 Q 5 -100 15 -95 Q 25 -100 35 -95 Q 45 -100 45 -80"
            fill="#1a1f3a"
            opacity="0.3"
          />
          
          {/* Torso */}
          <rect x="-45" y="-30" width="90" height="120" rx="45" fill="url(#personGradient)" />
          
          {/* Arms */}
          <ellipse cx="-65" cy="20" rx="18" ry="60" fill="url(#personGradient)" transform="rotate(-25 -65 20)" />
          <ellipse cx="65" cy="20" rx="18" ry="60" fill="url(#personGradient)" transform="rotate(25 65 20)" />
          
          {/* Legs */}
          <ellipse cx="-25" cy="120" rx="20" ry="60" fill="url(#personGradient)" />
          <ellipse cx="25" cy="120" rx="20" ry="60" fill="url(#personGradient)" />
          
          {/* Key in Right Hand */}
          <g transform="translate(55, 25) rotate(30)">
            <rect x="-10" y="-4" width="20" height="8" rx="4" fill="#FFD700" />
            <circle cx="0" cy="0" r="8" fill="none" stroke="#FFD700" strokeWidth="3" />
            <rect x="-14" y="-3" width="10" height="6" rx="2" fill="#FFD700" />
            <circle cx="-9" cy="0" r="3" fill="#1a1f3a" />
          </g>
        </g>
      </g>
      
      {/* Lock Icon - Left Side */}
      <g transform="translate(150, 250)">
        <rect x="-35" y="-25" width="70" height="90" rx="10" fill="#1a1f3a" opacity="0.1" />
        <rect x="-30" y="-20" width="60" height="60" rx="8" fill="#1a1f3a" />
        <path
          d="M -20 -20 Q -20 -35 0 -35 Q 20 -35 20 -20"
          stroke="#FFD700"
          strokeWidth="5"
          fill="none"
          strokeLinecap="round"
        />
        <circle cx="0" cy="10" r="12" fill="#FFD700" />
        <circle cx="0" cy="10" r="6" fill="#1a1f3a" />
      </g>
      
      {/* Shield Icon - Right Side */}
      <g transform="translate(650, 250)">
        <path
          d="M 0 -50 L 40 0 L 0 50 L -40 0 Z"
          fill="#1a1f3a"
          opacity="0.15"
        />
        <path
          d="M 0 -40 L 30 0 L 0 40 L -30 0 Z"
          fill="#1a1f3a"
        />
        <path
          d="M 0 -25 L 18 0 L 0 25 L -18 0 Z"
          fill="#FFD700"
        />
        <circle cx="0" cy="0" r="8" fill="#1a1f3a" />
        <path
          d="M -5 -5 L 0 0 L 5 -5"
          stroke="#FFFFFF"
          strokeWidth="2"
          fill="none"
          strokeLinecap="round"
        />
      </g>
      
      {/* Floating Security Elements */}
      <g transform="translate(200, 100)">
        <circle cx="0" cy="0" r="25" fill="#1a1f3a" opacity="0.1" />
        <circle cx="0" cy="0" r="15" fill="#1a1f3a" opacity="0.2" />
        <path
          d="M -8 -8 L 8 8 M 8 -8 L -8 8"
          stroke="#1a1f3a"
          strokeWidth="3"
          strokeLinecap="round"
          opacity="0.3"
        />
      </g>
      
      <g transform="translate(600, 450)">
        <circle cx="0" cy="0" r="20" fill="#1a1f3a" opacity="0.1" />
        <circle cx="0" cy="0" r="12" fill="#1a1f3a" opacity="0.2" />
        <circle cx="0" cy="0" r="6" fill="#FFD700" opacity="0.5" />
      </g>
      
      {/* Decorative Lines */}
      <path
        d="M 50 200 Q 150 150 250 200"
        stroke="#1a1f3a"
        strokeWidth="2"
        fill="none"
        opacity="0.1"
        strokeDasharray="8,8"
      />
      <path
        d="M 550 200 Q 650 150 750 200"
        stroke="#1a1f3a"
        strokeWidth="2"
        fill="none"
        opacity="0.1"
        strokeDasharray="8,8"
      />
    </Box>
  );
}
