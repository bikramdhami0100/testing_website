"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { HeartPulse, ShieldCheck, Activity, Clock, AlertTriangle, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"
import { runReliabilityTest } from "@/lib/test-engine"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { ReliabilityTestResult } from "@/types"

export default function ReliabilityTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<ReliabilityTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await runReliabilityTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Reliability Testing</h1>
        <p className="text-muted-foreground">Measure uptime, recovery capabilities, and overall system stability</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 space-y-4">
          <Input placeholder="https://api.example.com/endpoint" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
          <div className="flex items-end gap-3">
            <div className="flex-1" />
            <Button onClick={runTest} disabled={loading || !url.trim()} className="h-9">
              {loading ? <HeartPulse className="w-4 h-4 animate-pulse" /> : <HeartPulse className="w-4 h-4" />}
              {loading ? "Running..." : "Run Reliability Test"}
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
                  <HeartPulse className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Uptime</p>
                  <p className="text-xl font-bold">{result.uptime?.toFixed(2)}%</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <RefreshCw className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Recovery Time</p>
                  <p className="text-xl font-bold">{result.recoveryTime?.toFixed(0)}s</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Failover Time</p>
                  <p className="text-xl font-bold">{result.failoverTime?.toFixed(0)}s</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Crash Count</p>
                  <p className="text-xl font-bold">{result.crashCount}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                  <CardContent className="p-4 space-y-3">
                    <div className="flex justify-between"><span className="text-sm">Uptime</span><span className="font-medium">{result.uptime?.toFixed(2)}%</span></div>
                    <Progress value={result.uptime} className="h-2" />
                    <Separator className="bg-muted/20" />
                    <div className="flex justify-between">
                      <span className="text-sm">Recovery Status</span>
                      {result.recoverySuccess ? (
                        <Badge variant="default" className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Success</Badge>
                      ) : (
                        <Badge variant="destructive" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Failed</Badge>
                      )}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-sm">Failover Support</span>
                      {result.failoverSupported ? (
                        <Badge variant="default" className="flex items-center gap-1"><ShieldCheck className="w-3 h-3" /> Supported</Badge>
                      ) : (
                        <Badge variant="secondary" className="flex items-center gap-1"><AlertTriangle className="w-3 h-3" /> Not Supported</Badge>
                      )}
                    </div>
                    <Separator className="bg-muted/20" />
                    <div className="flex justify-between"><span className="text-sm">Stability Score</span><span className="font-medium">{result.stabilityScore}/100</span></div>
                    <div className="flex justify-between"><span className="text-sm">Overall Score</span><Badge variant={result.score >= 70 ? "default" : result.score >= 40 ? "secondary" : "destructive"}>{result.score}</Badge></div>
                  </CardContent>
                </Card>
              </div>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> Recommendations</CardTitle></CardHeader>
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
            <HeartPulse className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Run a reliability test to begin</p>
            <p className="text-sm text-muted-foreground/60">Assess uptime, recovery, failover, and overall system stability</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
