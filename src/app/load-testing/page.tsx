"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Separator } from "@/components/ui/separator"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Activity, TrendingUp, Users, Clock, AlertTriangle, CheckCircle, Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils"
import { runLoadTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { LoadTestResult } from "@/types"

const VIRTUAL_USERS = [10, 50, 100, 500, 1000, 5000]

export default function LoadTestingPage() {
  const [url, setUrl] = React.useState("")
  const [virtualUsers, setVirtualUsers] = React.useState(50)
  const [duration, setDuration] = React.useState(30)
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<LoadTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runLoadTest(url, virtualUsers, duration)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }

  const maxRps = result?.requestsPerSecond ? result.requestsPerSecond * 1.5 : 1

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Load Testing</h1>
        <p className="text-muted-foreground">Simulate traffic, measure performance under load, and find breaking points</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 space-y-4">
          <Input placeholder="https://api.example.com/endpoint" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Virtual Users</Label>
              <Select value={String(virtualUsers)} onValueChange={(v) => setVirtualUsers(Number(v))}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {VIRTUAL_USERS.map((n) => (
                    <SelectItem key={n} value={String(n)}>{n.toLocaleString()} users</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Duration (seconds)</Label>
              <Input type="number" value={duration} onChange={(e) => setDuration(Number(e.target.value))} min={5} max={300} />
            </div>
            <div className="flex items-end">
              <Button onClick={runTest} disabled={loading || !url.trim()} className="h-9">
                {loading ? <Activity className="w-4 h-4 animate-pulse" /> : <Zap className="w-4 h-4" />}
                {loading ? "Running..." : "Run Load Test"}
              </Button>
            </div>
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
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Avg Response</p>
                  <p className="text-xl font-bold">{result.avgResponseTime?.toFixed(0)}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Peak</p>
                  <p className="text-xl font-bold">{result.peakResponseTime?.toFixed(0)}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Throughput</p>
                  <p className="text-xl font-bold">{result.throughput?.toFixed(1)}/s</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">RPS</p>
                  <p className="text-xl font-bold">{result.requestsPerSecond?.toFixed(1)}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Activity className="w-4 h-4" /> Requests Per Second</CardTitle></CardHeader>
                <CardContent>
                  {result.resourceUsage?.cpu && (
                    <div className="space-y-1">
                      {result.resourceUsage.cpu.slice(0, 20).map((val, i) => (
                        <div key={i} className="flex items-center gap-2 text-xs">
                          <span className="w-8 text-muted-foreground">{i}s</span>
                          <div className="flex-1 h-4 bg-muted/30 rounded-sm overflow-hidden">
                            <div className={cn("h-full rounded-sm", val > 80 ? "bg-red-500" : val > 50 ? "bg-amber-500" : "bg-emerald-500")} style={{ width: `${val}%` }} />
                          </div>
                          <span className="w-10 text-right text-muted-foreground">{val.toFixed(0)}%</span>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              <div className="space-y-4">
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-sm">Error Rate</span><Badge variant={result.errorRate && result.errorRate > 0.1 ? "destructive" : result.errorRate && result.errorRate > 0.05 ? "secondary" : "default"}>{(result.errorRate ?? 0 * 100).toFixed(1)}%</Badge></div>
                    <div className="flex justify-between"><span className="text-sm">Success Rate</span><span className="font-medium">{(result.successRate ?? 0 * 100).toFixed(1)}%</span></div>
                    <Progress value={(result.successRate ?? 0) * 100} className="h-2" />
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-sm">Virtual Users</span><span className="font-medium">{result.virtualUsers}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Duration</span><span className="font-medium">{result.duration}s</span></div>
                    <div className="flex justify-between"><span className="text-sm">Breaking Point</span><span className="font-medium">{result.breakingPoint?.toFixed(0)} users</span></div>
                    <div className="flex justify-between"><span className="text-sm">Max Concurrent</span><span className="font-medium">{result.maxConcurrentUsers?.toFixed(0)}</span></div>
                    <div className="flex justify-between"><span className="text-sm">Recovery Time</span><span className="font-medium">{result.recoveryTime?.toFixed(1)}s</span></div>
                    <div className="flex justify-between"><span className="text-sm">Stability</span><Badge variant={result.stability ? "default" : "destructive"}>{result.stability ? "Stable" : "Unstable"}</Badge></div>
                    <div className="flex justify-between"><span className="text-sm">Memory Leaks</span><Badge variant={result.memoryLeaks ? "destructive" : "default"}>{result.memoryLeaks ? "Detected" : "None"}</Badge></div>
                  </CardContent>
                </Card>
              </div>
            </div>

            {result.percentiles && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Percentiles</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid grid-cols-5 gap-4">
                    {Object.entries(result.percentiles).map(([p, v]) => (
                      <div key={p} className="text-center">
                        <p className="text-xs text-muted-foreground">{p}</p>
                        <p className="text-lg font-bold">{v.toFixed(0)}ms</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Activity className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Configure and run a load test</p>
            <p className="text-sm text-muted-foreground/60">Simulate multiple virtual users and measure performance metrics</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
