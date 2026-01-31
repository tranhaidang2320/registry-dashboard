"use client"

import * as React from "react"
import { MoreHorizontal } from "lucide-react"

import { Button } from "@/components/ui/button"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

export type RowActionItem = {
  label: string
  onSelect: () => void
  icon?: React.ReactNode
  disabled?: boolean
  destructive?: boolean
  separator?: boolean
}

export default function RowActionsMenu({
  actions,
  align = "end",
  label = "Open row actions",
}: {
  actions: RowActionItem[]
  align?: "start" | "end"
  label?: string
}) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="icon-sm"
          aria-label={label}
        >
          <MoreHorizontal className="h-4 w-4" />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align={align} className="w-48">
        {actions.map((action, index) => {
          if (action.separator) {
            return <DropdownMenuSeparator key={`separator-${index}`} />
          }
          return (
            <DropdownMenuItem
              key={action.label}
              onSelect={action.onSelect}
              disabled={action.disabled}
              variant={action.destructive ? "destructive" : "default"}
            >
              {action.icon}
              {action.label}
            </DropdownMenuItem>
          )
        })}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
