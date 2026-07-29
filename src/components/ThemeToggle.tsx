"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Moon, Sun } from "lucide-react";

type Theme = "dark" | "light";

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>("dark");

  useEffect(() => {
    const current = (document.documentElement.getAttribute("data-theme") as Theme) || "dark";
    setTheme(current);
  }, []);

  function toggle() {
    const next: Theme = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    try {
      localStorage.setItem("nexapp-theme", next);
    } catch {
      // localStorage unavailable — theme just won't persist across visits
    }
  }

  return (
    <motion.button
      onClick={toggle}
      whileHover={{ scale: 1.08 }}
      whileTap={{ scale: 0.92 }}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
      className="glass aurora-border flex h-9 w-9 items-center justify-center rounded-full"
    >
      {theme === "dark" ? <Sun size={16} /> : <Moon size={16} />}
    </motion.button>
  );
}
