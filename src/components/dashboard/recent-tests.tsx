"use client";

import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import {
  History,
  CheckCircle,
  XCircle,
  Loader2,
  ExternalLink,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { getTestHistory } from "@/lib/storage";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import type { TestHistoryItem, TestType } from "@/types";

const TEST_LABELS: Record<TestType, string> = {
  "full-audit": "Full Audit",
  performance: "Performance",
  seo: "SEO",
  accessibility: "Accessibility",
  security: "Security",
  "html-css-js": "HTML/CSS/JS",
  visual: "Visual",
  api: "API",
  load: "Load Test",
  "framework-detection": "Framework Detection",
  functional: "Functional",
  "cross-browser": "Cross Browser",
  "best-practices": "Best Practices",
  login: "Login",
  refresh: "Refresh",
  navigation: "Navigation",
  scalability: "Scalability",
  volume: "Volume",
  capacity: "Capacity",
  concurrency: "Concurrency",
  reliability: "Reliability",
};

function StatusBadge({ status }: { status: TestHistoryItem["status"] }) {
  if (status === "completed") {
    return (
      <Badge variant="default" className="bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20 gap-1">
        <CheckCircle className="h-3 w-3" />
        Completed
      </Badge>
    );
  }
  if (status === "failed") {
    return (
      <Badge variant="destructive" className="gap-1">
        <XCircle className="h-3 w-3" />
        Failed
      </Badge>
    );
  }
  return (
    <Badge variant="secondary" className="gap-1">
      <Loader2 className="h-3 w-3 animate-spin" />
      Running
    </Badge>
  );
}

function ScoreBadge({ score }: { score?: number }) {
  if (score == null) return null;
  const color =
    score >= 80
      ? "bg-emerald-500/15 text-emerald-600 dark:text-emerald-400 border-emerald-500/20"
      : score >= 50
        ? "bg-amber-500/15 text-amber-600 dark:text-amber-400 border-amber-500/20"
        : "bg-red-500/15 text-red-600 dark:text-red-400 border-red-500/20";
  return (
    <Badge
      variant="outline"
      className={cn("font-mono tabular-nums", color)}
    >
      {score}
    </Badge>
  );
}

export function RecentTests() {
  const [history, setHistory] = useState<TestHistoryItem[]>([]);

  useEffect(() => {
    setHistory(getTestHistory().slice(0, 10));
    const handler = () => setHistory(getTestHistory().slice(0, 10));
    window.addEventListener("storage", handler);
    return () => window.removeEventListener("storage", handler);
  }, []);

  const empty = history.length === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
    >
      <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-lg">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-xl">
            <History className="h-5 w-5 text-primary" />
            Recent Tests
          </CardTitle>
        </CardHeader>
        <CardContent>
          {empty ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <History className="h-12 w-12 text-muted-foreground/30 mb-4" />
              <p className="text-lg font-medium text-muted-foreground">
                No tests yet
              </p>
              <p className="text-sm text-muted-foreground/60 mt-1">
                Run your first test using the Quick Test form above.
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border">
                    <th className="text-left font-medium text-muted-foreground py-3 px-2">
                      URL
                    </th>
                    <th className="text-left font-medium text-muted-foreground py-3 px-2 hidden sm:table-cell">
                      Type
                    </th>
                    <th className="text-center font-medium text-muted-foreground py-3 px-2">
                      Score
                    </th>
                    <th className="text-center font-medium text-muted-foreground py-3 px-2">
                      Status
                    </th>
                    <th className="text-right font-medium text-muted-foreground py-3 px-2 hidden md:table-cell">
                      Date
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {history.map((item) => (
                    <tr
                      key={item.id}
                      className="border-b border-border/50 hover:bg-muted/30 transition-colors"
                    >
                      <td className="py-3 px-2 max-w-[200px] sm:max-w-[280px]">
                        <div className="flex items-center gap-1.5">
                          <ExternalLink className="h-3 w-3 shrink-0 text-muted-foreground" />
                          <span className="truncate font-medium">
                            {item.url.replace(/^https?:\/\//, "")}
                          </span>
                        </div>
                      </td>
                      <td className="py-3 px-2 hidden sm:table-cell">
                        <span className="text-muted-foreground">
                          {TEST_LABELS[item.type] ?? item.type}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center">
                        <ScoreBadge score={item.score} />
                      </td>
                      <td className="py-3 px-2 text-center">
                        <StatusBadge status={item.status} />
                      </td>
                      <td className="py-3 px-2 text-right text-muted-foreground hidden md:table-cell tabular-nums">
                        {new Date(item.timestamp).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </CardContent>
      </Card>
    </motion.div>
  );
}
