import React, { createContext, useContext, useEffect, useState } from "react";
import {
  Theme,
  getStoredTheme,
  setStoredTheme,
  applyTheme,
  getSystemTheme,
} from "@/lib/theme";

interface ThemeContextType {
  theme: Theme;
  setTheme: (theme: Theme) => void;
  resolvedTheme: "light" | "dark";
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);


export function ThemeProvider({ children }: { children: React.ReactNode }) {

  const [theme, setThemeState] = useState<Theme>("light");
  const [resolvedTheme, setResolvedTheme] = useState<"light" | "dark">("light");

  const setTheme = (newTheme: Theme) => {
    setThemeState(newTheme);
    try {
      if (typeof window !== "undefined") {
        setStoredTheme(newTheme);
        applyTheme(newTheme);
      }
    } catch {
    }

    if (newTheme === "system") {
      const system = typeof window !== "undefined" ? getSystemTheme() : "light";
      setResolvedTheme(system);
    } else {
      setResolvedTheme(newTheme);
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") return;

    let chosen: Theme;
    try {
      const stored = getStoredTheme();
      chosen = stored ?? "light";
    } catch {
      chosen = "light";
    }

    try {
      applyTheme(chosen);
    } catch {
    }

    setThemeState(chosen);

    if (chosen === "system") {
      try {
        setResolvedTheme(getSystemTheme());
      } catch {
        setResolvedTheme("light");
      }
    } else {
      setResolvedTheme(chosen === "light" ? "light" : "dark");
    }

    if (chosen === "system" && typeof window !== "undefined" && window.matchMedia) {
      const mql = window.matchMedia("(prefers-color-scheme: dark)");
      const handler = (ev: MediaQueryListEvent) => {
        if (chosen === "system") {
          const newResolved = ev.matches ? "dark" : "light";
          setResolvedTheme(newResolved);
          try {
            applyTheme("system");
          } catch {
          }
        }
      };

      if (mql.addEventListener) mql.addEventListener("change", handler);
      else mql.addListener(handler);

      return () => {
        if (mql.removeEventListener) mql.removeEventListener("change", handler);
        else mql.removeListener(handler);
      };
    }

    return;
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, resolvedTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error("useTheme must be used within a ThemeProvider");
  }
  return context;
}
