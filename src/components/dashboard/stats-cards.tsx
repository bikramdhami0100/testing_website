"use client";

import { useEffect, useState } from "react";
import { motion, useMotionValue, animate } from "framer-motion";
import {
  Activity,
  CheckCircle,
  AlertTriangle,
  TrendingUp,
  Clock,
  Zap,
} from "lucide-react";
import { formatDateRelative } from "@/lib/utils";
import { getTestHistory } from "@/lib/storage";
import { Card, CardContent } from "@/components/ui/card";
import type { TestHistoryItem } from "@/types";

function AnimatedCounter({
  from = 0,
  to,
  suffix = "",
  decimals = 0,
}: {
  from?: number;
  to: number;
  suffix?: string;
  decimals?: number;
}) {
  const [display, setDisplay] = useState(from);
  const count = useMotionValue(from);
  useEffect(() => {
    const unsubscribe = count.on("change", (v) => setDisplay(Number(v)));
    const controls = animate(count, to, { duration: 1.5, ease: "easeOut" });
    return () => {
      controls.stop();
      unsubscribe();
    };
  }, [to, count]);
  return (
    <span className="text-3xl font-bold tabular-nums">
      {display.toFixed(decimals)}
      {suffix}
    </span>
  );
}

interface StatCardProps {
  label: string;
  value: number;
  suffix?: string;
  decimals?: number;
  subtext?: string;
  icon: React.ReactNode;
  trend?: "up" | "down" | "neutral";
}

function StatCard({
  label,
  value,
  suffix = "",
  decimals = 0,
  subtext,
  icon,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <Card className="relative overflow-hidden border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-lg hover:shadow-xl transition-shadow">
        <CardContent className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <p className="text-sm font-medium text-muted-foreground">
                {label}
              </p>
              <div className="flex items-baseline gap-1">
                <AnimatedCounter
                  to={value}
                  suffix={suffix}
                  decimals={decimals}
                />
              </div>
              {subtext && (
                <p className="text-xs text-muted-foreground">{subtext}</p>
              )}
            </div>
            <div className="rounded-full bg-primary/10 p-3 text-primary">
              {icon}
            </div>
          </div>
        </CardContent>
        <div className="absolute inset-x-0 top-0 h-[2px] bg-gradient-to-r from-transparent via-primary/40 to-transparent" />
      </Card>
    </motion.div>
  );
}

export function StatsCards() {
  const [history, setHistory] = useState<TestHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getTestHistory());
    const handler = () => setHistory(getTestHistory());
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const totalTests = history.length;
  const passed = history.filter(
    (t) => t.status === "completed" && t.score != null && t.score >= 70
  ).length;
  const failed = history.filter(
    (t) => t.status === "completed" && t.score != null && t.score < 70
  ).length;
  const scores = history
    .filter((t) => t.score != null)
    .map((t) => t.score as number);
  const avgScore = scores.length
    ? scores.reduce((a, b) => a + b, 0) / scores.length
    : 0;
  const lastTest = history.length
    ? history.reduce((a, b) => (a.timestamp > b.timestamp ? a : b))
    : null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const testsToday = history.filter(
    (t) => new Date(t.timestamp) >= today
  ).length;

  const cards: StatCardProps[] = [
    {
      label: "Total Tests Run",
      value: totalTests,
      icon: <Activity className="h-5 w-5" />,
      subtext: "All time",
    },
    {
      label: "Tests Passed",
      value: passed,
      icon: <CheckCircle className="h-5 w-5" />,
      subtext: `${totalTests ? Math.round((passed / totalTests) * 100) : 0}% pass rate`,
    },
    {
      label: "Issues Found",
      value: failed,
      icon: <AlertTriangle className="h-5 w-5" />,
      subtext: "Tests with score < 70",
    },
    {
      label: "Avg Score",
      value: avgScore,
      suffix: "%",
      decimals: 1,
      icon: <TrendingUp className="h-5 w-5" />,
      subtext: `Across ${scores.length} tests`,
    },
    {
      label: "Last Test",
      value: lastTest ? 0 : 0,
      icon: <Clock className="h-5 w-5" />,
      subtext: lastTest
        ? `${lastTest.url} — ${formatDateRelative(lastTest.timestamp)}`
        : "No tests yet",
    },
    {
      label: "Tests Today",
      value: testsToday,
      icon: <Zap className="h-5 w-5" />,
      subtext: `${today.toLocaleDateString("en-US", { month: "short", day: "numeric" })}`,
    },
  ];

  return (
    <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6">
      {cards.map((card) => (
        <StatCard key={card.label} {...card} />
      ))}
    </div>
  );
}
