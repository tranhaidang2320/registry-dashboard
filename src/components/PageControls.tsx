import * as React from "react"

import { cn } from "@/lib/utils"

type PageControlsProps = {
  leftControls?: React.ReactNode
  rightControls?: React.ReactNode
  className?: string
}

export default function PageControls({
  leftControls,
  rightControls,
  className,
}: PageControlsProps) {
  return (
    <div
      className={cn(
        "flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between",
        className
      )}
    >
      <div className="flex flex-wrap items-center gap-2">
        {leftControls}
      </div>
      <div className="flex items-center gap-2">{rightControls}</div>
    </div>
  )
}
