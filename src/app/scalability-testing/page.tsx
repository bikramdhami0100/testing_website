"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { TrendingUp, BarChart3, Users, Activity, Gauge } from "lucide-react"
import { cn } from "@/lib/utils"
import { runScalabilityTest } from "@/lib/test-engine"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { ScalabilityTestResult } from "@/types"

export default function ScalabilityTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<ScalabilityTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await runScalabilityTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Scalability Testing</h1>
        <p className="text-muted-foreground">Measure how your system scales under increasing user load across multiple stages</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 space-y-4">
          <Input placeholder="https://api.example.com/endpoint" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
          <div className="flex items-end gap-3">
            <div className="flex-1" />
            <Button onClick={runTest} disabled={loading || !url.trim()} className="h-9">
              {loading ? <Activity className="w-4 h-4 animate-pulse" /> : <TrendingUp className="w-4 h-4" />}
              {loading ? "Running..." : "Run Scalability Test"}
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
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <TrendingUp className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Linearity Score</p>
                  <p className="text-xl font-bold">{result.linearityScore?.toFixed(0)}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <BarChart3 className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Saturation Point</p>
                  <p className="text-xl font-bold">{result.saturationPoint?.toLocaleString()} users</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Gauge className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Score</p>
                  <p className="text-xl font-bold">{result.score}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Users className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Stages</p>
                  <p className="text-xl font-bold">{result.stages?.length}</p>
                </CardContent>
              </Card>
            </div>

            {result.stages && result.stages.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><BarChart3 className="w-4 h-4" /> Multi-Stage Results</CardTitle></CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead>
                        <tr className="border-b border-muted/20">
                          <th className="text-left py-2 px-3 text-muted-foreground font-medium">Users</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Avg Response</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Error Rate</th>
                          <th className="text-right py-2 px-3 text-muted-foreground font-medium">Throughput</th>
                        </tr>
                      </thead>
                      <tbody>
                        {result.stages.map((stage, i) => (
                          <tr key={i} className={cn("border-b border-muted/10", stage.users === result.saturationPoint && "bg-destructive/5")}>
                            <td className="py-2 px-3 font-medium">{stage.users.toLocaleString()}</td>
                            <td className="text-right py-2 px-3">{stage.avgResponse.toFixed(0)}ms</td>
                            <td className="text-right py-2 px-3">
                              <Badge variant={stage.errorRate > 0.15 ? "destructive" : stage.errorRate > 0.1 ? "secondary" : "default"}>
                                {(stage.errorRate * 100).toFixed(1)}%
                              </Badge>
                            </td>
                            <td className="text-right py-2 px-3">{stage.throughput.toFixed(1)}/s</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 space-y-2">
                  <div className="flex justify-between"><span className="text-sm">Linearity Score</span><span className="font-medium">{result.linearityScore?.toFixed(0)}/100</span></div>
                  <div className="flex justify-between"><span className="text-sm">Saturation Point</span><span className="font-medium">{result.saturationPoint?.toLocaleString()} users</span></div>
                  <div className="flex justify-between"><span className="text-sm">Overall Score</span><Badge variant={result.score >= 70 ? "default" : result.score >= 40 ? "secondary" : "destructive"}>{result.score}</Badge></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><TrendingUp className="w-4 h-4" /> Recommendations</CardTitle></CardHeader>
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
            <TrendingUp className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Run a scalability test to see results</p>
            <p className="text-sm text-muted-foreground/60">Evaluate system behavior across increasing user loads</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
