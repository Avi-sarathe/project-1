import React, { useState, useEffect } from "react";
import { Contrast } from "lucide-react";

/**
 * Hook to manage Black and White (monochrome) theme state
 */
export function useBwTheme() {
  const [isBw, setIsBw] = useState(() => {
    try {
      return localStorage.getItem("immersia_bw_theme") === "true";
    } catch {
      return false;
    }
  });

  useEffect(() => {
    try {
      if (isBw) {
        document.documentElement.classList.add("bw-theme");
      } else {
        document.documentElement.classList.remove("bw-theme");
      }
      localStorage.setItem("immersia_bw_theme", String(isBw));
    } catch (err) {
      console.warn("Theme toggle storage error:", err);
    }
  }, [isBw]);

  const toggleBw = () => setIsBw((prev) => !prev);

  return { isBw, toggleBw };
}

/**
 * One-click Black and White Theme Switcher button
 */
export default function ThemeToggle({ className = "", variant = "default" }) {
  const { isBw, toggleBw } = useBwTheme();

  if (variant === "hud") {
    // HUD style for StreetViewer top-right bar
    return (
      <button
        type="button"
        onClick={toggleBw}
        className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 border shadow-lg ${
          isBw
            ? "bg-white text-black border-white shadow-[0_0_15px_rgba(255,255,255,0.4)]"
            : "bg-[#20232a]/90 backdrop-blur-md text-[#f1f3f4] border-white/10 hover:bg-[#2d323c] hover:border-white/30"
        } ${className}`}
        title={isBw ? "Switch back to Full Color" : "Switch to Black & White (Monochrome High-Contrast)"}
        aria-label="Toggle Black & White theme"
      >
        <Contrast className={`w-3.5 h-3.5 transition-transform duration-300 ${isBw ? "rotate-180 text-black" : "text-gray-300"}`} />
        <span>{isBw ? "B&W: ON" : "B&W Mode"}</span>
      </button>
    );
  }

  // Default Landing / Header style
  return (
    <button
      type="button"
      onClick={toggleBw}
      className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-full text-xs font-semibold cursor-pointer transition-all duration-200 border shadow-sm select-none ${
        isBw
          ? "bg-slate-900 text-white border-slate-700 shadow-md ring-2 ring-slate-400/40"
          : "bg-white/90 text-slate-700 border-slate-200 hover:bg-white hover:text-slate-900 hover:border-slate-300"
      } ${className}`}
      title={isBw ? "Switch back to Full Color" : "Switch to Black & White (Monochrome High-Contrast)"}
      aria-label="Toggle Black & White theme"
    >
      <Contrast className={`w-3.5 h-3.5 transition-transform duration-300 ${isBw ? "rotate-180" : ""}`} />
      <span>{isBw ? "B&W Mode (Active)" : "Black & White"}</span>
    </button>
  );
}
