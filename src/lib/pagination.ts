import * as React from "react"

type Token = string | null

export function usePaginationStack(key: string) {
  const [stack, setStack] = React.useState<Token[]>([])

  React.useEffect(() => {
    if (typeof window === "undefined") return
    const raw = window.sessionStorage.getItem(key)
    if (!raw) return
    try {
      const parsed = JSON.parse(raw)
      if (Array.isArray(parsed)) {
        setStack(parsed as Token[])
      }
    } catch {
      // ignore invalid storage
    }
  }, [key])

  const saveStack = React.useCallback(
    (next: Token[]) => {
      setStack(next)
      if (typeof window !== "undefined") {
        window.sessionStorage.setItem(key, JSON.stringify(next))
      }
    },
    [key]
  )

  return { stack, saveStack }
}
