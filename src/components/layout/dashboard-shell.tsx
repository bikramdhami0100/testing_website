"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface DashboardShellProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode
}

export function DashboardShell({ children, className, ...props }: DashboardShellProps) {
  return (
    <div className={cn("flex flex-col gap-8 p-8 max-w-7xl mx-auto w-full", className)} {...props}>
      {children}
    </div>
  )
}
