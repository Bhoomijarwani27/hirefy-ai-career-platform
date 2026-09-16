"use client";

import React from "react";

interface HirefyLogoProps {
  size?: number;
  showWordmark?: boolean;
  className?: string;
}

export function HirefyLogo({
  size = 44,
  showWordmark = true,
  className = "",
}: HirefyLogoProps) {
  const gradientId = React.useId();

  return (
    <div className={`flex items-center gap-3 ${className}`}>
      {/* Logo Icon */}
      <svg
        width={size}
        height={size}
        viewBox="0 0 64 64"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-label="Hirefy"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="8"
            y1="8"
            x2="56"
            y2="56"
            gradientUnits="userSpaceOnUse"
          >
            <stop offset="0%" stopColor="#3B82F6" />
            <stop offset="50%" stopColor="#6366F1" />
            <stop offset="100%" stopColor="#A855F7" />
          </linearGradient>
        </defs>

        {/* Background adapts to theme */}
        <rect
          x="3"
          y="3"
          width="58"
          height="58"
          rx="16"
          className="fill-slate-100 dark:fill-slate-900"
          stroke={`url(#${gradientId})`}
          strokeWidth="2"
        />

        {/* H */}
        <rect
          x="18"
          y="17"
          width="7"
          height="30"
          rx="3.5"
          fill={`url(#${gradientId})`}
        />

        <rect
          x="39"
          y="17"
          width="7"
          height="30"
          rx="3.5"
          fill={`url(#${gradientId})`}
        />

        {/* Nexus connection */}
        <path
          d="M22 32C27 25 36 25 42 32"
          stroke={`url(#${gradientId})`}
          strokeWidth="7"
          strokeLinecap="round"
        />

        {/* Nodes */}
        <circle
          cx="22"
          cy="32"
          r="3"
          fill="#60A5FA"
        />

        <circle
          cx="42"
          cy="32"
          r="3"
          fill="#A78BFA"
        />
      </svg>

      {/* Wordmark */}
      {showWordmark && (
        <div className="flex flex-col leading-none">
          <span className="text-xl font-bold tracking-tight text-slate-900 dark:text-white">
            Hirefy
            <span className="bg-linear-to-r from-blue-500 via-indigo-500 to-purple-500 bg-clip-text text-transparent">
              .ai
            </span>
          </span>

          <span className="mt-1 text-[9px] font-medium uppercase tracking-[0.18em] text-slate-500 dark:text-slate-400">
            Smart Career Platform
          </span>
        </div>
      )}
    </div>
  );
}