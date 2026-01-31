"use client"

import * as React from "react"

export type Theme = "light" | "dark" | "system"

type ThemeContextValue = {
  theme: Theme
  resolvedTheme: "light" | "dark"
  setTheme: (theme: Theme) => void
}

const ThemeContext = React.createContext<ThemeContextValue | null>(null)

const STORAGE_KEY = "registry-theme"

function getSystemTheme() {
  return window.matchMedia("(prefers-color-scheme: dark)").matches
    ? "dark"
    : "light"
}

function applyTheme(theme: Theme) {
  const resolved = theme === "system" ? getSystemTheme() : theme
  document.documentElement.classList.toggle("dark", resolved === "dark")
  return resolved
}

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = React.useState<Theme>("system")
  const [resolvedTheme, setResolvedTheme] = React.useState<
    "light" | "dark"
  >("light")

  React.useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY) as Theme | null
      if (stored) {
        setTheme(stored)
      }
    } catch {
      // ignore
    }
  }, [])

  React.useEffect(() => {
    const resolved = applyTheme(theme)
    setResolvedTheme(resolved)

    let media: MediaQueryList | null = null
    const handleChange = () => {
      if (theme === "system") {
        setResolvedTheme(applyTheme(theme))
      }
    }

    if (theme === "system") {
      media = window.matchMedia("(prefers-color-scheme: dark)")
      media.addEventListener("change", handleChange)
    }

    try {
      window.localStorage.setItem(STORAGE_KEY, theme)
    } catch {
      // ignore
    }

    return () => {
      if (media) {
        media.removeEventListener("change", handleChange)
      }
    }
  }, [theme])

  const value = React.useMemo(
    () => ({ theme, resolvedTheme, setTheme }),
    [theme, resolvedTheme]
  )

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const context = React.useContext(ThemeContext)
  if (!context) {
    throw new Error("useTheme must be used within ThemeProvider")
  }
  return context
}
