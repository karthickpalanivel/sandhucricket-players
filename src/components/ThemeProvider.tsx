"use client";

import { createContext, useContext, useEffect, useState } from "react";

type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggleTheme: () => void;
}>({
  theme: "light",
  toggleTheme: () => {},
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useState<Theme>("light");
  
  // We use this to prevent the "Hydration Mismatch" warning
  // But we MUST wrap the children in the Provider regardless
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    // 1. Check LocalStorage or System Preference on mount
    const savedTheme = localStorage.getItem("sandhu_cricket_theme") as Theme;
    
    if (savedTheme) {
      setTheme(savedTheme);
      document.documentElement.classList.toggle("dark", savedTheme === "dark");
    } else if (window.matchMedia("(prefers-color-scheme: dark)").matches) {
      setTheme("dark");
      document.documentElement.classList.add("dark");
    }
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    
    // Toggle the class on the HTML tag
    document.documentElement.classList.toggle("dark", newTheme === "dark");
    
    // Save to storage
    localStorage.setItem("sandhu_cricket_theme", newTheme);
  };

  // Prevent hydration mismatch by rendering a placeholder or default until mounted
  // However, to ensure the context exists, we render the provider.
  // The 'if (!mounted)' check effectively removed the context, breaking the button.
  if (!mounted) {
    return (
        <ThemeContext.Provider value={{ theme: "light", toggleTheme: () => {} }}>
            {/* Render nothing or a loader until mounted to avoid flash, 
                OR render children with default light theme. 
                Rendering children is better for SEO/Speed. */}
            <div style={{ visibility: 'hidden' }}>{children}</div>
        </ThemeContext.Provider>
    );
  }

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export const useTheme = () => useContext(ThemeContext);