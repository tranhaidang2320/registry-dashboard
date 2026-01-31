import * as React from "react"

import { cn } from "@/lib/utils"

function Panel({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("border rounded-lg bg-card", className)}
      {...props}
    />
  )
}

function PanelHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn(
        "px-3 py-2 border-b flex items-center justify-between gap-2",
        className
      )}
      {...props}
    />
  )
}

export { Panel, PanelHeader }
