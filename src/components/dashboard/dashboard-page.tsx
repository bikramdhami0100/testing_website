"use client";

import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { FileText, ChevronRight } from "lucide-react";
import { DashboardShell } from "@/components/dashboard/dashboard-shell";
import { StatsCards } from "@/components/dashboard/stats-cards";
import { QuickTest } from "@/components/dashboard/quick-test";
import { RecentTests } from "@/components/dashboard/recent-tests";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

interface Report {
  id: string;
  url: string;
  timestamp: number;
  score?: number;
}

export function DashboardPage() {
  const [reports, setReports] = useState<Report[]>([]);

  useEffect(() => {
    try {
      const raw = localStorage.getItem("reports");
      if (raw) {
        const parsed = JSON.parse(raw);
        if (Array.isArray(parsed)) {
          setReports(parsed.slice(0, 5));
        }
      }
    } catch {}
  }, []);

  return (
    <DashboardShell>
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex flex-col gap-1 mb-2">
          <h1 className="text-3xl font-bold tracking-tight">
            Dashboard Overview
          </h1>
          <p className="text-muted-foreground">
            Monitor your website tests, view results, and run new checks.
          </p>
        </div>
      </motion.div>

      <StatsCards />

      <div className="grid gap-6 lg:grid-cols-5">
        <div className="lg:col-span-3">
          <QuickTest />
        </div>
        <div className="lg:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4, delay: 0.15 }}
          >
            <Card className="border-white/20 dark:border-white/10 bg-white/70 dark:bg-white/5 backdrop-blur-xl shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-xl">
                  <FileText className="h-5 w-5 text-primary" />
                  Recent Reports
                </CardTitle>
              </CardHeader>
              <CardContent>
                {reports.length === 0 ? (
                  <div className="flex flex-col items-center justify-center py-8 text-center">
                    <FileText className="h-10 w-10 text-muted-foreground/30 mb-3" />
                    <p className="text-sm text-muted-foreground">
                      No reports saved yet.
                    </p>
                    <p className="text-xs text-muted-foreground/60 mt-1">
                      Reports appear here after running tests.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    {reports.map((report) => (
                      <div
                        key={report.id}
                        className="flex items-center justify-between rounded-lg border border-border/50 px-3 py-2.5 hover:bg-muted/30 transition-colors"
                      >
                        <div className="flex flex-col min-w-0">
                          <span className="text-sm font-medium truncate">
                            {report.url.replace(/^https?:\/\//, "")}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {new Date(report.timestamp).toLocaleDateString(
                              "en-US",
                              {
                                month: "short",
                                day: "numeric",
                                hour: "2-digit",
                                minute: "2-digit",
                              }
                            )}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 shrink-0">
                          {report.score != null && (
                            <Badge
                              variant="outline"
                              className="font-mono tabular-nums"
                            >
                              {report.score}
                            </Badge>
                          )}
                          <ChevronRight className="h-4 w-4 text-muted-foreground" />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>

      <RecentTests />
    </DashboardShell>
  );
}
