"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";
import { useEffect, useState } from "react";

export default function ThemeToggle() {
  const { theme, setTheme, systemTheme } = useTheme();
  const [mounted, setMounted] = useState(false);

  useEffect(() => setMounted(true), []);

  const current = theme === "system" ? systemTheme : theme;
  if (!mounted) return null;

  return (
    <button
      aria-label="Toggle theme"
      onClick={() => setTheme(current === "dark" ? "light" : "dark")}
      className="inline-flex items-center justify-center size-9 rounded-full border border-input bg-transparent hover:bg-secondary/50 transition-colors"
    >
      {current === "dark" ? (
        <Sun className="size-4 text-primary-200" />
      ) : (
        <Moon className="size-4 text-foreground" />
      )}
    </button>
  );
}


