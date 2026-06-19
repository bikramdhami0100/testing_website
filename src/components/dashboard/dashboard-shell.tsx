"use client";

import { cn } from "@/lib/utils";

interface DashboardShellProps {
  children: React.ReactNode;
  className?: string;
}

export function DashboardShell({ children, className }: DashboardShellProps) {
  return (
    <div className={cn("flex-1 space-y-8 p-6 md:p-8 pt-6", className)}>
      {children}
    </div>
  );
}
