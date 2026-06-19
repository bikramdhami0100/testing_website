"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { Users, GitBranch, AlertTriangle, Activity, Shield } from "lucide-react"
import { cn } from "@/lib/utils"
import { runConcurrencyTest } from "@/lib/test-engine"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { ConcurrencyTestResult } from "@/types"

export default function ConcurrencyTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<ConcurrencyTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await runConcurrencyTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Concurrency Testing</h1>
        <p className="text-muted-foreground">Detect deadlocks, race conditions, and measure performance under concurrent access</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 space-y-4">
          <Input placeholder="https://api.example.com/endpoint" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
          <div className="flex items-end gap-3">
            <div className="flex-1" />
            <Button onClick={runTest} disabled={loading || !url.trim()} className="h-9">
              {loading ? <Users className="w-4 h-4 animate-pulse" /> : <Users className="w-4 h-4" />}
              {loading ? "Running..." : "Run Concurrency Test"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-24 rounded-xl" />)}
          </motion.div>
        )}

        {error && !loading && (
          <ErrorState message={error} onRetry={runTest} />
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Concurrent Users</p>
                  <p className="text-xl font-bold">{result.concurrentUsers?.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                  <p className="text-xl font-bold">{result.avgResponseTime?.toFixed(0)}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Max Response</p>
                  <p className="text-xl font-bold">{result.maxResponseTime?.toFixed(0)}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Error Rate</p>
                  <p className="text-xl font-bold">{(result.errorRate * 100).toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-sm">Deadlock Detection</span>
                      {result.deadlockDetected ? (
                        <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Detected</Badge>
                      ) : (
                        <Badge variant="default" className="flex items-center gap-1"><Shield className="w-3 h-3" /> None</Badge>
                      )}
                    </div>
                    <Separator className="bg-muted/20" />
                    {result.raceConditions && result.raceConditions.length > 0 && (
                      <div className="space-y-1">
                        <p className="text-sm font-medium flex items-center gap-1"><GitBranch className="w-3 h-3" /> Race Conditions</p>
                        <ul className="space-y-1">
                          {result.raceConditions.map((rc, i) => (
                            <li key={i} className="text-xs text-destructive flex items-start gap-1">
                              <AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />
                              <span>{rc}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    <Separator className="bg-muted/20" />
                    <div className="flex justify-between"><span className="text-sm">Score</span><Badge variant={result.score >= 70 ? "default" : result.score >= 40 ? "secondary" : "destructive"}>{result.score}</Badge></div>
                  </CardContent>
                </Card>
              </div>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Recommendations</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.recommendations?.map((r, i) => (
                      <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </div>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <GitBranch className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Run a concurrency test to begin</p>
            <p className="text-sm text-muted-foreground/60">Identify deadlocks, race conditions, and concurrency bottlenecks</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
