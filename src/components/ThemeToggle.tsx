"use client";

import { Moon, Sun } from "lucide-react";
import { useTheme } from "./ThemeProvider";

export function ThemeToggle() {
  const { theme, toggle } = useTheme();

  return (
    <>
      <button
        onClick={toggle}
        className="hidden sm:inline-flex cursor-pointer items-center gap-1.5 rounded-lg px-2 py-2 text-sm text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
        title={theme === "dark" ? "Modo claro" : "Modo escuro"}
      >
        {theme === "dark" ? <><Sun size={16} /> Claro</> : <><Moon size={16} /> Escuro</>}
      </button>
      <button
        onClick={toggle}
        className="sm:hidden cursor-pointer rounded-lg p-2 text-[var(--muted-foreground)] hover:bg-[var(--muted)] transition-colors"
        title={theme === "dark" ? "Modo claro" : "Modo escuro"}
      >
        {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
      </button>
    </>
  );
}
