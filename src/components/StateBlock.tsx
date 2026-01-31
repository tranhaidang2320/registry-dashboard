import * as React from "react"

import { cn } from "@/lib/utils"

type StateBlockProps = {
  title: React.ReactNode
  description?: React.ReactNode
  icon?: React.ReactNode
  actions?: React.ReactNode
  className?: string
}

export default function StateBlock({
  title,
  description,
  icon,
  actions,
  className,
}: StateBlockProps) {
  return (
    <div
      className={cn(
        "border rounded-lg p-10 flex flex-col items-center text-center gap-2",
        className
      )}
    >
      {icon ? <div className="text-muted-foreground">{icon}</div> : null}
      <h3 className="text-sm font-medium">{title}</h3>
      {description ? (
        <p className="text-sm text-muted-foreground max-w-md">
          {description}
        </p>
      ) : null}
      {actions ? <div className="mt-2 flex gap-2">{actions}</div> : null}
    </div>
  )
}
