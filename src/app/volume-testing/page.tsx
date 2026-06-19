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
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Database, HardDrive, Server, Clock, MemoryStick } from "lucide-react"
import { cn } from "@/lib/utils"
import { runVolumeTest } from "@/lib/test-engine"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { VolumeTestResult } from "@/types"

const DATASET_SIZES = ["10k records", "100k records", "1M records", "10M records"]

export default function VolumeTestingPage() {
  const [url, setUrl] = React.useState("")
  const [datasetSize, setDatasetSize] = React.useState("100k records")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<VolumeTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const res = await runVolumeTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Volume Testing</h1>
        <p className="text-muted-foreground">Assess system performance with large data volumes and measure resource consumption</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 space-y-4">
          <Input placeholder="https://api.example.com/endpoint" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Dataset Size</Label>
              <Select value={datasetSize} onValueChange={setDatasetSize}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DATASET_SIZES.map((s) => (
                    <SelectItem key={s} value={s}>{s}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-end">
              <Button onClick={runTest} disabled={loading || !url.trim()} className="h-9">
                {loading ? <Database className="w-4 h-4 animate-pulse" /> : <Database className="w-4 h-4" />}
                {loading ? "Running..." : "Run Volume Test"}
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
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Clock className="w-6 h-6 mx-auto mb-1 text-blue-500" />
                  <p className="text-xs text-muted-foreground">Avg Response Time</p>
                  <p className="text-xl font-bold">{result.avgResponseTime?.toFixed(0)}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <MemoryStick className="w-6 h-6 mx-auto mb-1 text-amber-500" />
                  <p className="text-xs text-muted-foreground">Peak Memory</p>
                  <p className="text-xl font-bold">{(result.peakMemoryUsage / 1024).toFixed(1)}GB</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <Server className="w-6 h-6 mx-auto mb-1 text-emerald-500" />
                  <p className="text-xs text-muted-foreground">Processing Time</p>
                  <p className="text-xl font-bold">{result.processingTime?.toFixed(0)}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 text-center">
                  <HardDrive className="w-6 h-6 mx-auto mb-1 text-purple-500" />
                  <p className="text-xs text-muted-foreground">Throughput</p>
                  <p className="text-xl font-bold">{result.throughput?.toFixed(1)}/s</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 space-y-3">
                  <div className="flex justify-between"><span className="text-sm">Dataset Size</span><Badge variant="outline">{result.datasetSize}</Badge></div>
                  <div className="flex justify-between"><span className="text-sm">Success Rate</span><span className="font-medium">{(result.successRate * 100).toFixed(1)}%</span></div>
                  <Progress value={result.successRate * 100} className="h-2" />
                  <Separator className="bg-muted/20" />
                  <div className="flex justify-between"><span className="text-sm">Score</span><Badge variant={result.score >= 70 ? "default" : result.score >= 40 ? "secondary" : "destructive"}>{result.score}</Badge></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Database className="w-4 h-4" /> Recommendations</CardTitle></CardHeader>
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
            <Database className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Configure and run a volume test</p>
            <p className="text-sm text-muted-foreground/60">Test how your system handles large datasets under various loads</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
