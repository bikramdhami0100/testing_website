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
import { Gauge, Server, Cpu, HardDrive, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import { runCapacityTest } from "@/lib/test-engine"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { CapacityTestResult } from "@/types"

export default function CapacityTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<CapacityTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await runCapacityTest(url)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }

  const saturationColor = (val: number) =>
    val > 85 ? "bg-red-500" : val > 65 ? "bg-amber-500" : "bg-emerald-500"

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Capacity Testing</h1>
        <p className="text-muted-foreground">Determine maximum load your system can sustain and identify resource bottlenecks</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 space-y-4">
          <Input placeholder="https://api.example.com/endpoint" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
          <div className="flex items-end gap-3">
            <div className="flex-1" />
            <Button onClick={runTest} disabled={loading || !url.trim()} className="h-9">
              {loading ? <Gauge className="w-4 h-4 animate-pulse" /> : <Gauge className="w-4 h-4" />}
              {loading ? "Estimating..." : "Estimate Capacity"}
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
                  <Gauge className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Max Sustainable Load</p>
                  <p className="text-xl font-bold">{result.maxSustainableLoad?.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Server className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Peak Load Handling</p>
                  <p className="text-xl font-bold">{result.peakLoad?.toLocaleString()}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Activity className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Response at Peak</p>
                  <p className="text-xl font-bold">{result.avgResponseAtPeak?.toFixed(0)}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <HardDrive className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Error Rate at Peak</p>
                  <p className="text-xl font-bold">{(result.errorRateAtPeak * 100).toFixed(1)}%</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Cpu className="w-4 h-4" /> Resource Saturation</CardTitle></CardHeader>
                  <CardContent className="space-y-4">
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Cpu className="w-3 h-3" /> CPU</span><span>{result.resourceSaturation?.cpu ?? 0}%</span></div>
                      <Progress value={result.resourceSaturation?.cpu ?? 0} className={cn("h-3", saturationColor(result.resourceSaturation?.cpu ?? 0))} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Server className="w-3 h-3" /> Memory</span><span>{result.resourceSaturation?.memory ?? 0}%</span></div>
                      <Progress value={result.resourceSaturation?.memory ?? 0} className={cn("h-3", saturationColor(result.resourceSaturation?.memory ?? 0))} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><Activity className="w-3 h-3" /> Network</span><span>{result.resourceSaturation?.network ?? 0}%</span></div>
                      <Progress value={result.resourceSaturation?.network ?? 0} className={cn("h-3", saturationColor(result.resourceSaturation?.network ?? 0))} />
                    </div>
                    <div className="space-y-2">
                      <div className="flex justify-between text-sm"><span className="flex items-center gap-1"><HardDrive className="w-3 h-3" /> Disk</span><span>{result.resourceSaturation?.disk ?? 0}%</span></div>
                      <Progress value={result.resourceSaturation?.disk ?? 0} className={cn("h-3", saturationColor(result.resourceSaturation?.disk ?? 0))} />
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="space-y-4">
                <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                  <CardContent className="p-4 space-y-2">
                    <div className="flex justify-between"><span className="text-sm">Max Sustainable Load</span><span className="font-medium">{result.maxSustainableLoad?.toLocaleString()} users</span></div>
                    <div className="flex justify-between"><span className="text-sm">Peak Load</span><span className="font-medium">{result.peakLoad?.toLocaleString()} users</span></div>
                    <div className="flex justify-between"><span className="text-sm">Score</span><Badge variant={result.score >= 70 ? "default" : result.score >= 40 ? "secondary" : "destructive"}>{result.score}</Badge></div>
                  </CardContent>
                </Card>

                <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                  <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Gauge className="w-4 h-4" /> Recommendations</CardTitle></CardHeader>
                  <CardContent>
                    <ul className="space-y-1">
                      {result.recommendations?.map((r, i) => (
                        <li key={i} className="text-xs text-muted-foreground">• {r}</li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              </div>
            </div>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Gauge className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to estimate capacity</p>
            <p className="text-sm text-muted-foreground/60">Discover how much load your system can handle before breaking</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
