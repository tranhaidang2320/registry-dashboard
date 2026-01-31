"use client"
import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Badge } from "@/components/ui/badge"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

function shortDigest(digest: string, length = 12) {
  if (digest.length <= length) return digest
  return `${digest.slice(0, length)}...`
}

export default function DigestPill({
  digest,
  label = "Copy digest",
  className,
}: {
  digest: string
  label?: string
  className?: string
}) {
  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(digest)
      toast.success("Copied")
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <button
          type="button"
          onClick={handleCopy}
          className="inline-flex items-center gap-1"
          aria-label={label}
        >
          <Badge variant="secondary" className={"font-mono text-xs " + (className ?? "")}>
            {shortDigest(digest)}
          </Badge>
          <Copy className="h-3 w-3 text-muted-foreground" />
        </button>
      </TooltipTrigger>
      <TooltipContent>{label}</TooltipContent>
    </Tooltip>
  )
}
