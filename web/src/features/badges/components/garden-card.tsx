"use client";

import type { GardenPlant } from "../types";

export function GardenCard({ plant }: { plant: GardenPlant }) {
  return (
    <article className="group rounded-[20px] border border-[#dde7d5] bg-[linear-gradient(180deg,#fffef9_0%,#f7fbf2_100%)] p-2 shadow-[0_10px_24px_rgba(86,104,66,0.07)] transition-transform duration-200 hover:-translate-y-0.5">
      <div className="flex items-start justify-between gap-1.5">
        <p className="min-w-0 rounded-full bg-white/80 px-1.5 py-1 text-[8px] font-semibold tracking-[0.08em] text-[#708066]">
          {plant.mood}
        </p>
        <div className="shrink-0 rounded-full bg-[#edf3e4] px-1.5 py-1 text-[8px] font-semibold text-[#68805b]">
          第 {plant.days} 天
        </div>
      </div>

      <div className="mt-2 flex flex-col items-center text-center">
        <div className="flex h-[62px] w-[62px] items-center justify-center rounded-[18px] bg-[linear-gradient(180deg,#eef6e5_0%,#e5f0d9_100%)] shadow-[inset_0_1px_0_rgba(255,255,255,0.5)]">
          <GardenGlyph variety={plant.variety} />
        </div>

        <h3 className="mt-2 line-clamp-2 min-h-[2rem] font-serif text-[13px] leading-4 text-[#294033]">
          {plant.name}
        </h3>
        <p className="mt-1 rounded-full bg-[#edf3e4] px-2 py-1 text-[8px] font-semibold text-[#6b7b61]">
          养殖 {plant.days} 天
        </p>
      </div>
    </article>
  );
}

function GardenGlyph({ variety }: { variety: GardenPlant["variety"] }) {
  if (variety === "monstera") {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="24" width="6" height="26" rx="3" fill="#6e9b59" />
        <path d="M18 24 C 18 14 30 10 38 14 C 46 18 48 28 42 34 C 38 38 30 40 22 36 C 18 34 16 29 18 24 Z" fill="#7fbc62" />
        <circle cx="27" cy="24" r="2" fill="#edf9d8" />
        <circle cx="35" cy="28" r="2" fill="#edf9d8" />
        <circle cx="30" cy="33" r="2" fill="#edf9d8" />
      </svg>
    );
  }

  if (variety === "pothos") {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" xmlns="http://www.w3.org/2000/svg">
        <rect x="28" y="20" width="5" height="28" rx="2.5" fill="#6f9758" />
        <path d="M31 24 C 18 22 14 34 22 39 C 28 42 33 37 31 24 Z" fill="#89c46a" />
        <path d="M31 18 C 44 16 48 28 40 33 C 34 36 29 31 31 18 Z" fill="#78b95e" />
        <path d="M33 40 C 43 40 47 48 42 54 C 37 55 31 50 33 40 Z" fill="#98d474" />
      </svg>
    );
  }

  if (variety === "cactus") {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" xmlns="http://www.w3.org/2000/svg">
        <rect x="20" y="42" width="24" height="8" rx="3" fill="#a06f45" />
        <rect x="27" y="14" width="10" height="30" rx="5" fill="#6cb45e" />
        <rect x="20" y="22" width="8" height="16" rx="4" fill="#7bc46c" />
        <rect x="36" y="26" width="8" height="14" rx="4" fill="#7bc46c" />
        <circle cx="38" cy="14" r="4" fill="#f2c0d6" />
      </svg>
    );
  }

  if (variety === "ficus") {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" xmlns="http://www.w3.org/2000/svg">
        <rect x="29" y="28" width="6" height="22" rx="3" fill="#876448" />
        <ellipse cx="25" cy="24" rx="10" ry="8" fill="#7fbc62" />
        <ellipse cx="39" cy="22" rx="10" ry="8" fill="#70aa55" />
        <ellipse cx="32" cy="16" rx="10" ry="8" fill="#93cf73" />
      </svg>
    );
  }

  if (variety === "fern") {
    return (
      <svg viewBox="0 0 64 64" className="h-11 w-11" xmlns="http://www.w3.org/2000/svg">
        <rect x="29" y="28" width="4" height="22" rx="2" fill="#6c9156" />
        <path d="M31 30 C 18 18 16 14 14 10 C 20 12 28 18 31 30 Z" fill="#8dcc72" />
        <path d="M31 34 C 18 28 14 26 10 22 C 18 22 26 26 31 34 Z" fill="#7dbe65" />
        <path d="M31 30 C 44 18 46 14 48 10 C 42 12 34 18 31 30 Z" fill="#8dcc72" />
        <path d="M31 34 C 44 28 48 26 52 22 C 44 22 36 26 31 34 Z" fill="#7dbe65" />
      </svg>
    );
  }

  return (
    <svg viewBox="0 0 64 64" className="h-11 w-11" xmlns="http://www.w3.org/2000/svg">
      <rect x="22" y="42" width="20" height="8" rx="3" fill="#b18455" />
      <rect x="30" y="18" width="4" height="25" rx="2" fill="#78a45d" />
      <ellipse cx="24" cy="20" rx="8" ry="10" fill="#87c96a" />
      <ellipse cx="40" cy="20" rx="8" ry="10" fill="#7dbe65" />
      <circle cx="32" cy="14" r="4" fill="#f7f3ea" />
    </svg>
  );
}
