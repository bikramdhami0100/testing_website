"use client";

import { usePathname } from "next/navigation";
import { PanelLeftClose, Plus } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ThemeToggle } from "./theme-toggle";

const pathTitles: Record<string, string> = {
  "/": "Overview",
  "/framework-detection": "Framework Detection",
  "/performance": "Performance",
  "/seo": "SEO",
  "/accessibility": "Accessibility",
  "/best-practices": "Best Practices",
  "/security": "Security",
  "/html-css-js": "HTML / CSS / JS",
  "/visual-testing": "Visual Testing",
  "/cross-browser-testing": "Cross Browser Testing",
  "/api-testing": "API Testing",
  "/functional-testing": "Functional Testing",
  "/browser-automation": "Browser Automation",
  "/login-testing": "Login Testing",
  "/refresh-testing": "Refresh Testing",
  "/navigation-testing": "Navigation Testing",
  "/load-testing": "Load Testing",
  "/scalability-testing": "Scalability Testing",
  "/volume-testing": "Volume Testing",
  "/capacity-testing": "Capacity Testing",
  "/concurrency-testing": "Concurrency Testing",
  "/reliability-testing": "Reliability Testing",
  "/acceptance-testing": "Acceptance Testing",
  "/responsive-testing": "Responsive Testing",
  "/mobile-testing": "Mobile Testing",
  "/desktop-testing": "Desktop Testing",
  "/ai-analysis": "AI Analysis",
  "/custom-test-builder": "Custom Tests",
  "/reports": "Reports",
  "/settings": "Settings",
};

interface HeaderProps {
  onMenuToggle?: () => void;
  onNewTest?: () => void;
}

export function Header({ onMenuToggle, onNewTest }: HeaderProps) {
  const pathname = usePathname();
  const title = pathTitles[pathname] ?? "AI Test Pro";

  return (
    <header
      className={cn(
        "sticky top-0 z-30 flex h-14 items-center gap-4 border-b px-4",
        "bg-white/10 dark:bg-black/10 backdrop-blur-xl",
        "border-white/20 dark:border-white/10"
      )}
    >
      {onMenuToggle && (
        <button
          onClick={onMenuToggle}
          className="flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors"
        >
          <PanelLeftClose className="h-4 w-4" />
        </button>
      )}

      <motion.h1
        key={title}
        initial={{ opacity: 0, y: -4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.2 }}
        className="text-lg font-semibold flex-1"
      >
        {title}
      </motion.h1>

      <div className="flex items-center gap-2">
        <Button variant="default" size="sm" onClick={onNewTest}>
          <Plus className="h-4 w-4 mr-1" />
          New Test
        </Button>
        <ThemeToggle />
      </div>
    </header>
  );
}
