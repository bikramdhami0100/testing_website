"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { RefreshCw, Clock, MemoryStick, Activity, AlertTriangle, ArrowUp, Timer } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils"
import { runRefreshTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { RefreshTestResult } from "@/types"

function ReloadBarChart({ times, maxTime }: { times: number[]; maxTime: number }) {
  return (
    <div className="flex items-end gap-1 h-20">
      {times.map((t, i) => {
        const height = (t / maxTime) * 100
        const color = t <= 800 ? "bg-emerald-500" : t <= 1500 ? "bg-amber-500" : "bg-red-500"
        return (
          <div key={i} className="flex-1 flex flex-col items-center gap-1">
            <div className={cn("w-full rounded-t-sm transition-all", color)} style={{ height: `${Math.max(height, 4)}%` }} />
            <span className="text-[10px] text-muted-foreground">{t.toFixed(0)}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function RefreshTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<RefreshTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runRefreshTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Refresh Testing</h1>
        <p className="text-muted-foreground">Test page reload performance, caching, and stability</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <RefreshCw className="w-4 h-4" />}
            {loading ? "Running..." : "Run Refresh Test"}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </motion.div>
        )}

        {error && !loading && (
          <ErrorState message={error} onRetry={runTest} />
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-5">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10 flex items-center justify-center p-4 md:col-span-1">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-24 h-24">
                    <svg width="96" height="96" className="transform -rotate-90">
                      <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                      <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8" className={result.score >= 80 ? "stroke-emerald-500" : result.score >= 50 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 - (result.score / 100) * 2 * Math.PI * 40} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                    </svg>
                    <span className="absolute text-xl font-bold">{result.score}</span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">Score</p>
                </div>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Clock className="w-8 h-8 text-blue-500" />
                    <div>
                      <p className="text-lg font-bold">{formatTime(result.averageReloadTime)}</p>
                      <p className="text-xs text-muted-foreground">Avg Reload Time</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Timer className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-lg font-bold">{result.cacheEffectiveness.toFixed(0)}%</p>
                      <p className="text-xs text-muted-foreground">Cache Effectiveness</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <Activity className={cn("w-8 h-8", result.stability ? "text-emerald-500" : "text-red-500")} />
                    <div>
                      <p className="text-lg font-bold">{result.stability ? "Stable" : "Unstable"}</p>
                      <p className="text-xs text-muted-foreground">Stability</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <MemoryStick className={cn("w-8 h-8", result.memoryGrowth <= 20 ? "text-emerald-500" : "text-red-500")} />
                    <div>
                      <p className="text-lg font-bold">{result.memoryGrowth.toFixed(0)} MB</p>
                      <p className="text-xs text-muted-foreground">Memory Growth</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="backdrop-blur-xl bg-background/60 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><RefreshCw className="w-4 h-4" /> Reload Times</CardTitle>
                <CardDescription>{result.reloadTimes.length} reloads measured</CardDescription>
              </CardHeader>
              <CardContent>
                <ReloadBarChart times={result.reloadTimes} maxTime={Math.max(...result.reloadTimes, 1)} />
                <div className="flex justify-between text-xs text-muted-foreground mt-2">
                  <span>Fast: {result.reloadTimes.filter((t) => t <= 800).length}</span>
                  <span>Avg: {formatTime(result.averageReloadTime)}</span>
                  <span>Slow: {result.reloadTimes.filter((t) => t > 1500).length}</span>
                </div>
              </CardContent>
            </Card>

            <div className="grid gap-4 md:grid-cols-2">
              {result.errors > 0 && (
                <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-red-500" /> Errors</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-2xl font-bold text-red-400">{result.errors}</p>
                    <p className="text-xs text-muted-foreground">errors occurred during refresh</p>
                  </CardContent>
                </Card>
              )}

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><MemoryStick className="w-4 h-4" /> Memory Analysis</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex justify-between mb-1"><span className="text-xs text-muted-foreground">Growth per refresh</span><span className="text-sm font-medium">{result.memoryGrowth.toFixed(1)} MB</span></div>
                  <Progress value={Math.min(100, (result.memoryGrowth / 50) * 100)} className="h-2" />
                  <p className="text-xs text-muted-foreground mt-1">{result.memoryGrowth > 20 ? "Possible memory leak detected" : "Memory usage is stable"}</p>
                </CardContent>
              </Card>
            </div>

            {result.recommendations.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2"><ArrowUp className="w-4 h-4 text-emerald-500" /> Recommendations</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {result.recommendations.map((rec, i) => (
                      <li key={i} className="flex items-start gap-2 text-sm"><ArrowUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{rec}</span></li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <RefreshCw className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to test page refresh performance</p>
            <p className="text-sm text-muted-foreground/60">Analyze reload times, cache effectiveness, and memory stability</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
