import { Link } from "@tanstack/react-router"
import { Search } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import ThemeToggle from "@/components/ThemeToggle"
import { useCommandPalette } from "@/components/CommandPalette"

export default function Header({ endpoint }: { endpoint?: string }) {
  const { setOpen } = useCommandPalette()

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 h-14 flex items-center gap-3">
        <div className="flex items-center gap-2 min-w-[180px]">
          <Button variant="ghost" size="sm" asChild>
            <Link to="/">Registry Dashboard</Link>
          </Button>
          {endpoint ? (
            <Badge
              variant="secondary"
              className="hidden sm:inline-flex text-xs text-muted-foreground"
            >
              {endpoint}
            </Badge>
          ) : null}
        </div>

        <div className="flex-1">
          <Button
            type="button"
            variant="outline"
            className="w-full justify-start text-muted-foreground gap-2"
            onClick={() => setOpen(true)}
          >
            <Search className="h-4 w-4" />
            <span>Search repos & tags...</span>
            <span className="ml-auto text-xs text-muted-foreground">Ctrl+K</span>
          </Button>
        </div>

        <div className="flex items-center gap-2 justify-end min-w-[180px]">
          <ThemeToggle />
        </div>
      </div>
    </header>
  )
}
