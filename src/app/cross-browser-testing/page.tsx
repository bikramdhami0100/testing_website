"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Globe, Smartphone, AlertTriangle, ArrowUp, Monitor } from "lucide-react"
import { cn } from "@/lib/utils"
import { runCrossBrowserTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { CrossBrowserResult } from "@/types"

const browserIcons: Record<string, React.ElementType> = {
  Chromium: Globe,
  Firefox: Globe,
  WebKit: Smartphone,
}

export default function CrossBrowserTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<CrossBrowserResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runCrossBrowserTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Cross-Browser Testing</h1>
        <p className="text-muted-foreground">Test compatibility across Chromium, Firefox, and WebKit browsers</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Globe className="w-4 h-4 animate-spin" /> : <Monitor className="w-4 h-4" />}
            {loading ? "Running..." : "Run Cross-Browser Test"}
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
                  <circle cx="56" cy="56" r="48" fill="none" strokeWidth="8" className={result.overallScore >= 80 ? "stroke-emerald-500" : result.overallScore >= 50 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 - (result.overallScore / 100) * 2 * Math.PI * 48} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                </svg>
                <span className="absolute text-2xl font-bold">{result.overallScore}</span>
              </div>
              <div>
                <p className="text-lg font-medium">Overall Score</p>
                <p className="text-sm text-muted-foreground">{result.browsers.filter((b) => b.supported).length} of {result.browsers.length} browsers supported</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              {result.browsers.map((browser) => {
                const Icon = browserIcons[browser.name] || Globe
                return (
                  <Card key={browser.name} className={cn("backdrop-blur-xl bg-background/60 border-white/10", !browser.supported && "opacity-60")}>
                    <CardHeader className="pb-2">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm flex items-center gap-2"><Icon className="w-4 h-4" /> {browser.name}</CardTitle>
                        <Badge variant={browser.supported ? "default" : "destructive"} className="text-xs">{browser.supported ? "Supported" : "Unsupported"}</Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-muted-foreground">Score</span>
                        <span className="text-sm font-bold">{browser.score}</span>
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Rendering</span>
                          <span>{browser.renderingScore}%</span>
                        </div>
                        <Progress value={browser.renderingScore} className="h-1.5" />
                      </div>
                      <div>
                        <div className="flex justify-between text-xs text-muted-foreground mb-1">
                          <span>Feature Support</span>
                          <span>{browser.featureSupport}%</span>
                        </div>
                        <Progress value={browser.featureSupport} className="h-1.5" />
                      </div>
                      {browser.issues.length > 0 && (
                        <div className="space-y-1">
                          <p className="text-xs text-muted-foreground font-medium">Issues:</p>
                          {browser.issues.map((issue, i) => (
                            <p key={i} className="text-xs text-red-400 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" />{issue}</p>
                          ))}
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )
              })}
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
            <Globe className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to run cross-browser tests</p>
            <p className="text-sm text-muted-foreground/60">Check compatibility across Chromium, Firefox, and WebKit</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
