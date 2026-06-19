"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Search,
  Gauge,
  SearchCheck,
  Accessibility,
  Shield,
  Code2,
  Image,
  PlugZap,
  Bot,
  Activity,
  ClipboardCheck,
  Smartphone,
  TabletSmartphone,
  Monitor,
  Brain,
  Wand2,
  FileText,
  Settings,
  Sparkles,
  PanelLeftClose,
  PanelLeftOpen,
  FlaskConical,
  Globe,
  ThumbsUp,
  Lock,
  RefreshCw,
  Compass,
  TrendingUp,
  Database,
  Gauge as CapacityGauge,
  Users,
  HeartPulse,
} from "lucide-react";
import { ScrollArea } from "@/components/ui/scroll-area";
import { cn } from "@/lib/utils";

interface NavItem {
  label: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
}

const navItems: NavItem[] = [
  { label: "Overview", href: "/", icon: LayoutDashboard },
  { label: "Framework Detection", href: "/framework-detection", icon: Search },
  { label: "Performance", href: "/performance", icon: Gauge },
  { label: "SEO", href: "/seo", icon: SearchCheck },
  { label: "Accessibility", href: "/accessibility", icon: Accessibility },
  { label: "Best Practices", href: "/best-practices", icon: ThumbsUp },
  { label: "Security", href: "/security", icon: Shield },
  { label: "HTML/CSS/JS", href: "/html-css-js", icon: Code2 },
  { label: "Visual Testing", href: "/visual-testing", icon: Image },
  { label: "Cross Browser Testing", href: "/cross-browser-testing", icon: Globe },
  { label: "API Testing", href: "/api-testing", icon: PlugZap },
  { label: "Functional Testing", href: "/functional-testing", icon: FlaskConical },
  { label: "Browser Automation", href: "/browser-automation", icon: Bot },
  { label: "Login Testing", href: "/login-testing", icon: Lock },
  { label: "Refresh Testing", href: "/refresh-testing", icon: RefreshCw },
  { label: "Navigation Testing", href: "/navigation-testing", icon: Compass },
  { label: "Load Testing", href: "/load-testing", icon: Activity },
  { label: "Scalability Testing", href: "/scalability-testing", icon: TrendingUp },
  { label: "Volume Testing", href: "/volume-testing", icon: Database },
  { label: "Capacity Testing", href: "/capacity-testing", icon: CapacityGauge },
  { label: "Concurrency Testing", href: "/concurrency-testing", icon: Users },
  { label: "Reliability Testing", href: "/reliability-testing", icon: HeartPulse },
  { label: "Acceptance Testing", href: "/acceptance-testing", icon: ClipboardCheck },
  { label: "Responsive Testing", href: "/responsive-testing", icon: Smartphone },
  { label: "Mobile Testing", href: "/mobile-testing", icon: TabletSmartphone },
  { label: "Desktop Testing", href: "/desktop-testing", icon: Monitor },
  { label: "AI Analysis", href: "/ai-analysis", icon: Brain },
  { label: "Custom Tests", href: "/custom-test-builder", icon: Wand2 },
  { label: "Reports", href: "/reports", icon: FileText },
  { label: "Settings", href: "/settings", icon: Settings },
];

interface SidebarProps {
  collapsed?: boolean;
  onToggle?: () => void;
}

export function Sidebar({ collapsed: controlledCollapsed, onToggle }: SidebarProps) {
  const pathname = usePathname();
  const [internalCollapsed, setInternalCollapsed] = useState(false);
  const collapsed = controlledCollapsed ?? internalCollapsed;

  const toggle = () => {
    if (onToggle) {
      onToggle();
    } else {
      setInternalCollapsed((c) => !c);
    }
  };

  return (
    <motion.aside
      layout
      transition={{ duration: 0.3, ease: "easeInOut" }}
      className={cn(
        "relative flex flex-col border-r",
        "bg-white/10 dark:bg-black/10 backdrop-blur-xl",
        "border-white/20 dark:border-white/10",
        "h-screen"
      )}
      style={{ width: collapsed ? 64 : 256 }}
    >
      <div className="flex h-14 items-center justify-between px-4 border-b border-white/20 dark:border-white/10">
        <AnimatePresence mode="wait">
          {!collapsed && (
            <motion.div
              initial={{ opacity: 0, x: -8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-2"
            >
              <Sparkles className="h-5 w-5 text-primary" />
              <span className="font-semibold text-sm">AI Test Pro</span>
            </motion.div>
          )}
          {collapsed && (
            <motion.div
              key="icon-only"
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.8 }}
              transition={{ duration: 0.2 }}
              className="mx-auto"
            >
              <Sparkles className="h-5 w-5 text-primary" />
            </motion.div>
          )}
        </AnimatePresence>
        <button
          onClick={toggle}
          className="flex items-center justify-center rounded-md p-1.5 hover:bg-accent transition-colors"
        >
          {collapsed ? (
            <PanelLeftOpen className="h-4 w-4" />
          ) : (
            <PanelLeftClose className="h-4 w-4" />
          )}
        </button>
      </div>

      <ScrollArea className="flex-1 px-2 py-3">
        <nav className="flex flex-col gap-1">
          {navItems.map((item) => {
            const isActive =
              item.href === "/"
                ? pathname === "/"
                : pathname.startsWith(item.href);
            const Icon = item.icon;
            return (
              <Link
                key={item.href}
                href={item.href}
                prefetch={false}
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                  isActive
                    ? "bg-primary/10 text-primary font-medium"
                    : "text-muted-foreground hover:bg-accent hover:text-accent-foreground"
                )}
              >
                <Icon className="h-4 w-4 shrink-0" />
                <AnimatePresence mode="wait">
                  {!collapsed && (
                    <motion.span
                      initial={{ opacity: 0, width: 0 }}
                      animate={{ opacity: 1, width: "auto" }}
                      exit={{ opacity: 0, width: 0 }}
                      transition={{ duration: 0.2 }}
                      className="overflow-hidden whitespace-nowrap"
                    >
                      {item.label}
                    </motion.span>
                  )}
                </AnimatePresence>
              </Link>
            );
          })}
        </nav>
      </ScrollArea>
    </motion.aside>
  );
}
