import { createContext, useContext, useEffect, useState } from "react";

import { useDesign } from "@/design/useDesign";
import { flushSync } from "react-dom";
type Theme = "light" | "dark";

const ThemeContext = createContext<{
  theme: Theme;
  toggle: () => void;
}>({ theme: "light", toggle: () => {} });

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const design = useDesign();
  const [preferred, setTheme] = useState<Theme>(() => {
    const stored = localStorage.getItem("msa-theme") as Theme | null;
    if (stored === "dark" || stored === "light") return stored;
    // Fall back to OS preference
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  });

  const theme: Theme = design.theme === "dark" || design.theme === "light" ? design.theme : preferred;

  useEffect(() => {
    document.documentElement.classList.toggle("dark", theme === "dark");
    if (design.theme !== "dark" && design.theme !== "light" && window.parent === window) localStorage.setItem("msa-theme", theme);
  }, [theme, design.theme]);

  return (
    <ThemeContext.Provider value={{
      theme,
      toggle: () => {
        if (design.theme === "dark" || design.theme === "light") return;
        const next=theme==="light"?"dark":"light";
        const apply=()=>{document.documentElement.classList.toggle("dark",next==="dark");setTheme(next);};
        if(design.themeMotion !== "instant" && !window.matchMedia("(prefers-reduced-motion: reduce)").matches && document.startViewTransition){
          document.startViewTransition(()=>flushSync(apply));
        } else apply();
      },
    }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => useContext(ThemeContext);
