"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ThumbsUp, Image, Zap, Server, AlertTriangle, CheckCircle, XCircle, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { runBestPracticesTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { ErrorState } from "@/components/shared/error-state"
import { motion, AnimatePresence } from "framer-motion"
import type { BestPracticesResult } from "@/types"

const practiceStatusIcon: Record<string, React.ElementType> = {
  pass: CheckCircle,
  fail: XCircle,
  warning: AlertTriangle,
}

const practiceStatusColor: Record<string, string> = {
  pass: "text-emerald-500",
  fail: "text-red-500",
  warning: "text-amber-500",
}

export default function BestPracticesPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<BestPracticesResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const ImageIcon = Image

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    try {
      addRecentUrl(url)
      const res = await runBestPracticesTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Best Practices</h1>
        <p className="text-muted-foreground">Check web development best practices, code quality, and optimization</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <ThumbsUp className="w-4 h-4 animate-pulse" /> : <ThumbsUp className="w-4 h-4" />}
            {loading ? "Running..." : "Check Best Practices"}
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
            <div className="flex items-center gap-4">
              <div className="relative inline-flex items-center justify-center w-28 h-28">
                <svg width="112" height="112" className="transform -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle cx="56" cy="56" r="48" fill="none" strokeWidth="8" className={result.score >= 80 ? "stroke-emerald-500" : result.score >= 50 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 - (result.score / 100) * 2 * Math.PI * 48} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                </svg>
                <span className="absolute text-2xl font-bold">{result.score}</span>
              </div>
              <div>
                <p className="text-lg font-medium">Best Practices Score</p>
                <p className="text-sm text-muted-foreground">Overall adherence to web best practices</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Zap className="w-4 h-4" /> Performance</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Lazy Loading</span><Badge variant={result.lazyLoading ? "default" : "secondary"} className="text-xs">{result.lazyLoading ? "Enabled" : "Disabled"}</Badge></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Cache Policy</span><span className="text-xs font-medium">{result.cachePolicy}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Compression</span><Badge variant={result.compression ? "default" : "destructive"} className="text-xs">{result.compression ? "Enabled" : "Disabled"}</Badge></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Image Optimization</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Total Images</span><span className="text-sm font-medium">{result.imageOptimization.totalImages}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Optimized</span><span className="text-sm font-medium">{result.imageOptimization.optimizedCount}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">Oversized</span><span className="text-sm font-medium text-red-400">{result.imageOptimization.oversizedImages.length}</span></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">WebP Support</span><Badge variant={result.imageOptimization.webpSupported ? "default" : "secondary"} className="text-xs">{result.imageOptimization.webpSupported ? "Yes" : "No"}</Badge></div>
                  <div className="flex justify-between"><span className="text-xs text-muted-foreground">AVIF Support</span><Badge variant={result.imageOptimization.avifSupported ? "default" : "secondary"} className="text-xs">{result.imageOptimization.avifSupported ? "Yes" : "No"}</Badge></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Deprecated APIs</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.deprecatedApis.length > 0 ? (
                    <ul className="space-y-1">
                      {result.deprecatedApis.map((api, i) => (
                        <li key={i} className="text-xs text-red-400 flex items-center gap-1"><XCircle className="w-3 h-3 shrink-0" />{api}</li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">No deprecated APIs detected</p>
                  )}
                </CardContent>
              </Card>
            </div>

            {result.imageOptimization.oversizedImages.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Oversized Images</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.imageOptimization.oversizedImages.map((img, i) => (
                      <li key={i} className="text-xs text-muted-foreground font-mono">{img}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            <Card className="backdrop-blur-xl bg-background/60 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Server className="w-4 h-4" /> HTTP Practices</CardTitle>
                <CardDescription>Web server and protocol best practices</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2">
                {result.httpPractices.map((p, i) => {
                  const Icon = practiceStatusIcon[p.status]
                  const color = practiceStatusColor[p.status]
                  return (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30">
                      <Icon className={cn("w-4 h-4 mt-0.5 shrink-0", color)} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-medium">{p.name}</span>
                          <Badge variant={p.status === "pass" ? "default" : p.status === "fail" ? "destructive" : "secondary"} className="text-xs">{p.status}</Badge>
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{p.detail}</p>
                      </div>
                    </div>
                  )
                })}
              </CardContent>
            </Card>

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
            <ThumbsUp className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to check best practices</p>
            <p className="text-sm text-muted-foreground/60">Get recommendations for web development best practices and optimization</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
