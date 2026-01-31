"use client"

import * as React from "react"
import { Copy } from "lucide-react"
import { toast } from "sonner"

import { Button } from "@/components/ui/button"
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip"

export default function CopyButton({
  value,
  label = "Copy",
  className,
  size = "icon-xs",
}: {
  value: string
  label?: string
  className?: string
  size?: "icon-xs" | "icon-sm" | "icon" | "icon-lg"
}) {
  const [isCopied, setIsCopied] = React.useState(false)

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(value)
      setIsCopied(true)
      toast.success("Copied")
      window.setTimeout(() => setIsCopied(false), 1500)
    } catch {
      toast.error("Copy failed")
    }
  }

  return (
    <Tooltip>
      <TooltipTrigger asChild>
        <Button
          type="button"
          size={size}
          variant="ghost"
          aria-label={label}
          onClick={handleCopy}
          className={className}
        >
          <Copy className="h-3.5 w-3.5" />
        </Button>
      </TooltipTrigger>
      <TooltipContent>{isCopied ? "Copied" : label}</TooltipContent>
    </Tooltip>
  )
}
