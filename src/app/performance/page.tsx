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
import { Gauge, Clock, Zap, BarChart3, Network, Wifi, RefreshCw, Navigation, Package, Shield, AlertTriangle, ArrowUp, ArrowDown, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatBytes, formatTime } from "@/lib/utils"
import { runPerformanceTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { PerformanceResult, WaterfallEntry } from "@/types"

function ScoreGauge({ score, size = 120 }: { score: number; size?: number }) {
  const radius = (size - 20) / 2
  const circumference = 2 * Math.PI * radius
  const offset = circumference - (score / 100) * circumference
  const color = score >= 90 ? "stroke-emerald-500" : score >= 70 ? "stroke-amber-500" : "stroke-red-500"

  return (
    <div className="relative inline-flex items-center justify-center">
      <svg width={size} height={size} className="transform -rotate-90">
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
        <circle cx={size / 2} cy={size / 2} r={radius} fill="none" strokeWidth="8" className={color} strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
      </svg>
      <span className="absolute text-2xl font-bold">{score}</span>
    </div>
  )
}

function WaterfallChart({ entries }: { entries: WaterfallEntry[] }) {
  const maxDuration = Math.max(...entries.map((e) => e.duration + e.startTime), 1)
  const typeColors: Record<string, string> = {
    script: "bg-blue-500",
    stylesheet: "bg-purple-500",
    image: "bg-green-500",
    font: "bg-amber-500",
    fetch: "bg-cyan-500",
    document: "bg-rose-500",
  }

  return (
    <div className="space-y-1">
      {entries.slice(0, 15).map((entry, i) => (
        <div key={i} className="flex items-center gap-2 text-xs">
          <span className="w-6 text-right text-muted-foreground">{i + 1}</span>
          <div className="flex-1 h-5 bg-muted/30 rounded-sm relative overflow-hidden">
            <div className={cn("h-full rounded-sm absolute", typeColors[entry.type] || "bg-gray-500")} style={{ left: `${(entry.startTime / maxDuration) * 100}%`, width: `${(entry.duration / maxDuration) * 100}%`, minWidth: 2 }} />
          </div>
          <span className="w-16 text-right text-muted-foreground">{entry.duration.toFixed(0)}ms</span>
        </div>
      ))}
    </div>
  )
}

function VitalsCard({ label, value, unit, icon: Icon, status }: { label: string; value: number; unit: string; icon: React.ElementType; status: "good" | "needs-improvement" | "poor" }) {
  const statusColors = { good: "text-emerald-500", "needs-improvement": "text-amber-500", poor: "text-red-500" }

  return (
    <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
      <CardContent className="p-4">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs text-muted-foreground">{label}</span>
          <Icon className={cn("w-4 h-4", statusColors[status])} />
        </div>
        <div className="text-xl font-bold">{value.toFixed(unit === "s" && value > 100 ? 2 : unit === "ms" ? 0 : 2)}<span className="text-xs font-normal text-muted-foreground ml-1">{unit}</span></div>
      </CardContent>
    </Card>
  )
}

export default function PerformancePage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<PerformanceResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runPerformanceTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Performance Test</h1>
        <p className="text-muted-foreground">Analyze website performance, Core Web Vitals, and optimization opportunities</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
            {loading ? "Running..." : "Run Performance Test"}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20 col-span-1 md:col-span-2 lg:col-span-1 flex items-center justify-center p-6">
                <div className="text-center">
                  <ScoreGauge score={result.pageSpeed ?? 0} />
                  <p className="text-sm text-muted-foreground mt-2">Page Speed Score</p>
                </div>
              </Card>

              <div className="col-span-1 md:col-span-2 lg:col-span-3 grid gap-4 grid-cols-2 sm:grid-cols-3">
                <VitalsCard label="FCP" value={result.fcp ?? 0} unit="ms" icon={Clock} status={(result.fcp ?? 0) <= 1800 ? "good" : (result.fcp ?? 0) <= 3000 ? "needs-improvement" : "poor"} />
                <VitalsCard label="LCP" value={result.lcp ?? 0} unit="ms" icon={Clock} status={(result.lcp ?? 0) <= 2500 ? "good" : (result.lcp ?? 0) <= 4000 ? "needs-improvement" : "poor"} />
                <VitalsCard label="CLS" value={result.cls ?? 0} unit="" icon={BarChart3} status={(result.cls ?? 0) <= 0.1 ? "good" : (result.cls ?? 0) <= 0.25 ? "needs-improvement" : "poor"} />
                <VitalsCard label="INP" value={result.inp ?? 0} unit="ms" icon={Gauge} status={(result.inp ?? 0) <= 200 ? "good" : (result.inp ?? 0) <= 500 ? "needs-improvement" : "poor"} />
                <VitalsCard label="TTFB" value={result.ttfb ?? 0} unit="ms" icon={Network} status={(result.ttfb ?? 0) <= 600 ? "good" : (result.ttfb ?? 0) <= 1000 ? "needs-improvement" : "poor"} />
                <VitalsCard label="TTI" value={result.tti ?? 0} unit="ms" icon={Zap} status={(result.tti ?? 0) <= 3000 ? "good" : (result.tti ?? 0) <= 5000 ? "needs-improvement" : "poor"} />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Load Times</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Initial Load</span><span className="text-sm font-medium">{formatTime(result.initialLoadTime ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Refresh</span><span className="text-sm font-medium">{formatTime(result.refreshTime ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Navigation Speed</span><span className="text-sm font-medium">{formatTime(result.navigationSpeed ?? 0)}</span></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Package className="w-4 h-4" /> Bundle &amp; Cache</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Bundle Size</span><span className="text-sm font-medium">{formatBytes(result.bundleSize ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Compression</span><Badge variant={result.compression ? "default" : "destructive"} className="text-xs">{result.compression ? "Enabled" : "Disabled"}</Badge></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Cache Policy</span><span className="text-sm font-medium">{result.cacheAnalysis?.cachePolicy ?? "N/A"}</span></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Cache Details</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Static Cache</span><Badge variant={result.cacheAnalysis?.staticCache ? "default" : "destructive"} className="text-xs">{result.cacheAnalysis?.staticCache ? "Yes" : "No"}</Badge></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Dynamic Cache</span><Badge variant={result.cacheAnalysis?.dynamicCache ? "default" : "destructive"} className="text-xs">{result.cacheAnalysis?.dynamicCache ? "Yes" : "No"}</Badge></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">ETag</span><Badge variant={result.cacheAnalysis?.etag ? "default" : "secondary"} className="text-xs">{result.cacheAnalysis?.etag ? "Yes" : "No"}</Badge></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Wifi className="w-4 h-4" /> Resource Usage</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">CPU</span><span className="text-sm font-medium">{result.cpuUsage?.toFixed(0)}%</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Memory</span><span className="text-sm font-medium">{result.memoryUsage?.toFixed(0)} MB</span></div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Network Waterfall</CardTitle>
                  <CardDescription>Resource loading sequence</CardDescription>
                </CardHeader>
                <CardContent>
                  <WaterfallChart entries={result.networkWaterfall ?? []} />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader>
                  <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Render-Blocking Resources</CardTitle>
                  <CardDescription>Resources delaying page render</CardDescription>
                </CardHeader>
                <CardContent>
                  {result.renderBlockingResources && result.renderBlockingResources.length > 0 ? (
                    <ul className="space-y-1">
                      {result.renderBlockingResources.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground truncate font-mono">{r}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No render-blocking resources detected</p>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4" /> Recommendations</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm">
                      <ArrowUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                      <span>{rec}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Gauge className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL and run a performance test</p>
            <p className="text-sm text-muted-foreground/60">Get detailed insights on Core Web Vitals, load times, and optimization suggestions</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
