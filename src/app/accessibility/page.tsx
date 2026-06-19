"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Accessibility, AlertTriangle, CheckCircle, ArrowUp, Info, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { runAccessibilityTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { AccessibilityResult, AccessibilityViolation } from "@/types"

const impactColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  serious: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  moderate: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  minor: "bg-blue-500/10 text-blue-500 border-blue-500/30",
}

const levelColors: Record<string, string> = {
  A: "bg-red-500/10 text-red-500",
  AA: "bg-amber-500/10 text-amber-500",
  AAA: "bg-emerald-500/10 text-emerald-500",
}

export default function AccessibilityPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<AccessibilityResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runAccessibilityTest(url)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Accessibility Test</h1>
        <p className="text-muted-foreground">WCAG compliance audit and accessibility issue detection</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 flex gap-3">
          <Input
            placeholder="Enter URL (e.g. https://example.com)"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && runTest()}
            className="flex-1"
          />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Accessibility className="w-4 h-4 animate-pulse" /> : <Accessibility className="w-4 h-4" />}
            {loading ? "Running..." : "Run Accessibility Test"}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="grid gap-4 md:grid-cols-3"
          >
            {Array.from({ length: 4 }).map((_, i) => (
              <Skeleton key={i} className="h-24 rounded-xl" />
            ))}
          </motion.div>
        )}

        {error && !loading && (
          <ErrorState message={error} onRetry={runTest} />
        )}

        {result && !loading && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-6"
          >
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative inline-flex items-center justify-center w-28 h-28">
                <svg width="112" height="112" className="transform -rotate-90">
                  <circle
                    cx="56" cy="56" r="48"
                    fill="none" stroke="currentColor"
                    strokeWidth="8" className="text-muted/20"
                  />
                  <circle
                    cx="56" cy="56" r="48"
                    fill="none" strokeWidth="8"
                    className={
                      (result.score ?? 0) >= 90
                        ? "stroke-emerald-500"
                        : (result.score ?? 0) >= 70
                          ? "stroke-amber-500"
                          : "stroke-red-500"
                    }
                    strokeLinecap="round"
                    strokeDasharray={2 * Math.PI * 48}
                    strokeDashoffset={
                      2 * Math.PI * 48 -
                      ((result.score ?? 0) / 100) * 2 * Math.PI * 48
                    }
                    style={{ transition: "stroke-dashoffset 1s ease-in-out" }}
                  />
                </svg>
                <span className="absolute text-2xl font-bold">{result.score}</span>
              </div>
              <div>
                <Badge
                  className={cn(
                    "text-sm px-4 py-1",
                    levelColors[result.wcagLevel ?? "A"]
                  )}
                >
                  WCAG {result.wcagLevel}
                </Badge>
                <p className="text-sm text-muted-foreground mt-1">
                  {result.passes} checks passed
                </p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              {(["critical", "serious", "moderate", "minor"] as const).map(
                (impact) => {
                  const count =
                    result.violations?.filter((v) => v.impact === impact)
                      .length ?? 0
                  return (
                    <Card
                      key={impact}
                      className="backdrop-blur-xl bg-background/60 border-muted/20"
                    >
                      <CardContent className="p-4 flex items-center gap-3">
                        <AlertTriangle
                          className={cn(
                            "w-8 h-8",
                            impact === "critical"
                              ? "text-red-500"
                              : impact === "serious"
                                ? "text-orange-500"
                                : impact === "moderate"
                                  ? "text-amber-500"
                                  : "text-blue-500"
                          )}
                        />
                        <div>
                          <p className="text-2xl font-bold">{count}</p>
                          <p className="text-xs text-muted-foreground capitalize">
                            {impact}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  )
                }
              )}
            </div>

            {result.violations && result.violations.length > 0 && (
              <div className="space-y-3">
                <h2 className="text-lg font-semibold">Violations</h2>
                {result.violations.map((v, i) => (
                  <Card
                    key={i}
                    className={cn(
                      "backdrop-blur-xl bg-background/60",
                      v.impact === "critical"
                        ? "border-red-500/30"
                        : v.impact === "serious"
                          ? "border-orange-500/30"
                          : "border-muted/20"
                    )}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between gap-4">
                        <div className="space-y-1 flex-1">
                          <div className="flex items-center gap-2">
                            <Badge
                              className={cn(
                                "text-xs",
                                impactColors[v.impact]
                              )}
                            >
                              {v.impact}
                            </Badge>
                            <span className="text-sm font-mono text-muted-foreground">
                              {v.id}
                            </span>
                          </div>
                          <p className="text-sm font-medium">
                            {v.description}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {v.help}
                          </p>
                        </div>
                        <div className="text-right shrink-0">
                          <p className="text-lg font-bold">{v.nodes}</p>
                          <p className="text-xs text-muted-foreground">
                            nodes
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}

            {result.recommendations && result.recommendations.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2">
                    <ArrowUp className="w-4 h-4 text-emerald-500" />
                    Recommendations
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2 text-sm"
                      >
                        <CheckCircle className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                        <span>{rec}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Accessibility className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">
              Enter a URL to run an accessibility audit
            </p>
            <p className="text-sm text-muted-foreground/60">
              Check WCAG compliance, find violations, and improve accessibility
            </p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
