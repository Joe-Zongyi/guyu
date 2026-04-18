export function BadgeGlyph({
  icon,
  unlocked,
}: {
  icon: string;
  unlocked: boolean;
}) {
  if (icon === "sunrise") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle cx="32" cy="32" r="28" fill={unlocked ? "#ffd97d" : "#e2e8f0"} />
        <path
          d="M 12 40 Q 32 20 52 40"
          stroke={unlocked ? "#ff9f1c" : "#94a3b8"}
          strokeWidth="4"
          fill="none"
        />
        <circle cx="32" cy="32" r="10" fill={unlocked ? "#ff9f1c" : "#94a3b8"} />
        <rect x="10" y="44" width="44" height="4" rx="2" fill={unlocked ? "#8ebd67" : "#cbd5e1"} />
      </svg>
    );
  }

  if (icon === "leaf") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 12 C 50 12 52 30 52 44 C 52 50 48 54 44 54 C 28 54 12 40 12 24 C 12 16 20 12 32 12 Z"
          fill={unlocked ? "#8ebd67" : "#cbd5e1"}
        />
        <path
          d="M12 52 L32 32"
          stroke={unlocked ? "#ffffff" : "#f1f5f9"}
          strokeWidth="3"
          strokeLinecap="round"
        />
        <path
          d="M32 32 L44 24"
          stroke={unlocked ? "#ffffff" : "#f1f5f9"}
          strokeWidth="3"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (icon === "camera") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="10" y="20" width="44" height="32" rx="6" fill={unlocked ? "#4a5568" : "#cbd5e1"} />
        <rect x="24" y="14" width="16" height="6" rx="2" fill={unlocked ? "#a0aec0" : "#e2e8f0"} />
        <circle cx="32" cy="36" r="10" fill={unlocked ? "#e2e8f0" : "#f1f5f9"} />
        <circle cx="32" cy="36" r="6" fill={unlocked ? "#2d3748" : "#94a3b8"} />
        <circle cx="48" cy="26" r="2" fill={unlocked ? "#fc8181" : "#e2e8f0"} />
      </svg>
    );
  }

  if (icon === "nametag") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="12" y="22" width="40" height="24" rx="4" fill={unlocked ? "#f6ad55" : "#cbd5e1"} />
        <circle cx="18" cy="34" r="3" fill="#ffffff" />
        <path
          d="M18 34 Q 24 10 40 8"
          stroke={unlocked ? "#cbd5e1" : "#e2e8f0"}
          strokeWidth="2"
          fill="none"
        />
        <rect x="26" y="32" width="20" height="4" rx="2" fill="#ffffff" opacity="0.8" />
      </svg>
    );
  }

  if (icon === "waterdrop") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 12 C 32 12 14 36 14 44 C 14 54 22 60 32 60 C 42 60 50 54 50 44 C 50 36 32 12 32 12 Z"
          fill={unlocked ? "#63b3ed" : "#cbd5e1"}
        />
        <path
          d="M22 46 Q 26 54 32 54"
          stroke="#ffffff"
          strokeWidth="4"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
      </svg>
    );
  }

  if (icon === "raincare") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M18 26 C 18 18 24 12 32 12 C 40 12 46 18 46 26 H18 Z"
          fill={unlocked ? "#6b8fd6" : "#cbd5e1"}
        />
        <rect x="30" y="26" width="4" height="16" rx="2" fill={unlocked ? "#6b8fd6" : "#cbd5e1"} />
        <path d="M22 44 L20 52" stroke={unlocked ? "#70c7f2" : "#dbe4ee"} strokeWidth="3" strokeLinecap="round" />
        <path d="M32 44 L30 54" stroke={unlocked ? "#70c7f2" : "#dbe4ee"} strokeWidth="3" strokeLinecap="round" />
        <path d="M42 44 L40 52" stroke={unlocked ? "#70c7f2" : "#dbe4ee"} strokeWidth="3" strokeLinecap="round" />
        <path
          d="M24 34 C 28 28 36 28 40 34 C 36 38 28 38 24 34 Z"
          fill={unlocked ? "#8fcd72" : "#d8e2d0"}
        />
      </svg>
    );
  }

  if (icon === "wateringlog") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect x="14" y="14" width="28" height="36" rx="4" fill={unlocked ? "#fffef9" : "#e2e8f0"} stroke={unlocked ? "#9fb48d" : "#b8c2cf"} strokeWidth="2" />
        <path d="M20 24 H36" stroke={unlocked ? "#87b26f" : "#aab4c2"} strokeWidth="3" strokeLinecap="round" />
        <path d="M20 31 H34" stroke={unlocked ? "#87b26f" : "#aab4c2"} strokeWidth="3" strokeLinecap="round" />
        <path d="M20 38 H30" stroke={unlocked ? "#87b26f" : "#aab4c2"} strokeWidth="3" strokeLinecap="round" />
        <path
          d="M48 20 C 48 20 40 30 40 34 C 40 39 43.5 42 48 42 C 52.5 42 56 39 56 34 C 56 30 48 20 48 20 Z"
          fill={unlocked ? "#63b3ed" : "#cbd5e1"}
        />
      </svg>
    );
  }

  if (icon === "spark") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 8 C 32 24 40 32 56 32 C 40 32 32 40 32 56 C 32 40 24 32 8 32 C 24 32 32 24 32 8 Z"
          fill={unlocked ? "#f6e05e" : "#cbd5e1"}
        />
        <circle cx="32" cy="32" r="6" fill={unlocked ? "#d69e2e" : "#94a3b8"} />
      </svg>
    );
  }

  if (icon === "sunflower") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <circle
          cx="32"
          cy="32"
          r="22"
          fill={unlocked ? "#ecc94b" : "#cbd5e1"}
          stroke={unlocked ? "#d69e2e" : "#a0aec0"}
          strokeWidth="4"
          strokeDasharray="6 6"
        />
        <circle cx="32" cy="32" r="12" fill={unlocked ? "#744210" : "#94a3b8"} />
      </svg>
    );
  }

  if (icon === "sprout") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 50 L32 24"
          stroke={unlocked ? "#68d391" : "#cbd5e1"}
          strokeWidth="6"
          strokeLinecap="round"
        />
        <path
          d="M32 36 Q 44 36 48 24 C 40 24 32 30 32 36 Z"
          fill={unlocked ? "#48bb78" : "#a0aec0"}
        />
        <path
          d="M32 42 Q 20 42 16 30 C 24 30 32 36 32 42 Z"
          fill={unlocked ? "#9ae6b4" : "#e2e8f0"}
        />
        <rect x="16" y="50" width="32" height="6" rx="3" fill={unlocked ? "#744210" : "#94a3b8"} />
      </svg>
    );
  }

  if (icon === "calendar") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <rect
          x="12"
          y="16"
          width="40"
          height="36"
          rx="4"
          fill={unlocked ? "#ffffff" : "#e2e8f0"}
          stroke={unlocked ? "#cbd5e1" : "#94a3b8"}
          strokeWidth="2"
        />
        <path d="M12 28 L52 28" stroke={unlocked ? "#fc8181" : "#cbd5e1"} strokeWidth="6" />
        <rect x="20" y="10" width="4" height="12" rx="2" fill={unlocked ? "#718096" : "#a0aec0"} />
        <rect x="40" y="10" width="4" height="12" rx="2" fill={unlocked ? "#718096" : "#a0aec0"} />
        <circle cx="24" cy="40" r="3" fill={unlocked ? "#68d391" : "#cbd5e1"} />
      </svg>
    );
  }

  if (icon === "book") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M12 16 C 12 16 22 12 32 16 L32 52 C 22 48 12 52 12 52 Z"
          fill={unlocked ? "#63b3ed" : "#cbd5e1"}
        />
        <path
          d="M52 16 C 52 16 42 12 32 16 L32 52 C 42 48 52 52 52 52 Z"
          fill={unlocked ? "#90cdf4" : "#e2e8f0"}
        />
        <path d="M32 16 L32 52" stroke="#ffffff" strokeWidth="2" />
        <path d="M36 12 L36 24 C 40 24 44 20 44 20 Z" fill={unlocked ? "#68d391" : "#a0aec0"} />
      </svg>
    );
  }

  if (icon === "heart") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M32 54 C 32 54 10 36 10 22 C 10 12 22 8 32 20 C 42 8 54 12 54 22 C 54 36 32 54 32 54 Z"
          fill={unlocked ? "#fc8181" : "#cbd5e1"}
        />
        <path
          d="M22 20 Q 26 16 30 20"
          stroke="#ffffff"
          strokeWidth="3"
          strokeLinecap="round"
          fill="none"
          opacity="0.6"
        />
        <path
          d="M42 30 L50 22"
          stroke={unlocked ? "#ffffff" : "#f1f5f9"}
          strokeWidth="4"
          strokeLinecap="round"
        />
        <path
          d="M42 22 L50 30"
          stroke={unlocked ? "#ffffff" : "#f1f5f9"}
          strokeWidth="4"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  if (icon === "moon") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path
          d="M36 10 C 20 10 14 26 18 40 C 22 54 38 58 50 48 C 36 50 26 38 36 10 Z"
          fill={unlocked ? "#f6e05e" : "#cbd5e1"}
        />
        <circle cx="20" cy="18" r="2" fill={unlocked ? "#ffffff" : "#f1f5f9"} />
        <circle cx="48" cy="24" r="3" fill={unlocked ? "#ffffff" : "#f1f5f9"} />
      </svg>
    );
  }

  if (icon === "medal") {
    return (
      <svg
        viewBox="0 0 64 64"
        className="h-12 w-12 drop-shadow-sm"
        xmlns="http://www.w3.org/2000/svg"
      >
        <path d="M24 8 L32 24 L40 8 Z" fill={unlocked ? "#fc8181" : "#cbd5e1"} />
        <path d="M16 8 L24 8 L32 24 Z" fill={unlocked ? "#f56565" : "#a0aec0"} />
        <path d="M48 8 L40 8 L32 24 Z" fill={unlocked ? "#f56565" : "#a0aec0"} />
        <circle
          cx="32"
          cy="40"
          r="18"
          fill={unlocked ? "#ecc94b" : "#cbd5e1"}
          stroke={unlocked ? "#d69e2e" : "#94a3b8"}
          strokeWidth="4"
        />
        <path
          d="M28 44 C 28 44 26 36 32 32 C 38 36 36 44 36 44"
          fill="none"
          stroke={unlocked ? "#d69e2e" : "#94a3b8"}
          strokeWidth="2"
          strokeLinecap="round"
        />
      </svg>
    );
  }

  return (
    <svg
      viewBox="0 0 64 64"
      className="h-12 w-12 drop-shadow-sm"
      xmlns="http://www.w3.org/2000/svg"
    >
      <rect x="12" y="12" width="40" height="40" rx="20" fill={unlocked ? "#8ebd67" : "#cbd5e1"} />
      <circle cx="32" cy="32" r="6" fill="#ffffff" />
    </svg>
  );
}
