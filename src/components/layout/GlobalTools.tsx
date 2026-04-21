"use client";

import { useTheme } from "next-themes";
import { useAudio } from "@/components/providers/AudioProvider";
import { Moon, Sun, Volume2, VolumeX } from "lucide-react";
import { useEffect, useState } from "react";

export function GlobalTools() {
  const { theme, setTheme } = useTheme();
  const { isPlaying, togglePlay } = useAudio();
  const [mounted, setMounted] = useState(false);

  // Tránh lỗi Hydration mismatch của Next.js khi dùng next-themes
  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return (
    <div className="fixed bottom-6 right-6 flex flex-col gap-3 z-50">
      {/* Nút bật/tắt nhạc */}
      <button
        onClick={togglePlay}
        className="p-3 bg-background dark:bg-surface-dark border border-border dark:border-border-dark rounded-full shadow-sm hover:border-acca dark:hover:border-acca text-text-secondary hover:text-acca dark:text-text-darkSecondary dark:hover:text-acca transition-all duration-200"
        title={isPlaying ? "Mute Music" : "Play Lofi"}
      >
        {isPlaying ? <Volume2 className="w-5 h-5" /> : <VolumeX className="w-5 h-5" />}
      </button>

      {/* Nút Dark/Light Mode */}
      <button
        onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        className="p-3 bg-background dark:bg-surface-dark border border-border dark:border-border-dark rounded-full shadow-sm hover:border-acca dark:hover:border-acca text-text-secondary hover:text-acca dark:text-text-darkSecondary dark:hover:text-acca transition-all duration-200"
        title="Toggle Theme"
      >
        {theme === "dark" ? <Sun className="w-5 h-5" /> : <Moon className="w-5 h-5" />}
      </button>
    </div>
  );
}