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
import { Code2, FileType, Layout, Terminal, AlertTriangle, CheckCircle, XCircle, ArrowUp, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatBytes } from "@/lib/utils"
import { runHtmlCssJsTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { HtmlCssJsResult } from "@/types"

export default function HtmlCssJsPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<HtmlCssJsResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runHtmlCssJsTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">HTML/CSS/JS Analysis</h1>
        <p className="text-muted-foreground">Analyze code quality, detect issues, and get optimization recommendations</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Code2 className="w-4 h-4 animate-pulse" /> : <Code2 className="w-4 h-4" />}
            {loading ? "Running..." : "Run Code Analysis"}
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
                  <circle cx="56" cy="56" r="48" fill="none" strokeWidth="8" className={result.score && result.score >= 80 ? "stroke-emerald-500" : result.score && result.score >= 50 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 - ((result.score ?? 0) / 100) * 2 * Math.PI * 48} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                </svg>
                <span className="absolute text-2xl font-bold">{result.score}</span>
              </div>
              <Progress value={result.score ?? 0} className="flex-1 h-3" />
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1"><FileType className="w-4 h-4 text-blue-500" /><span className="text-xs text-muted-foreground">HTML Errors</span></div>
                  <p className="text-2xl font-bold">{result.htmlErrors}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1"><FileType className="w-4 h-4 text-amber-500" /><span className="text-xs text-muted-foreground">HTML Warnings</span></div>
                  <p className="text-2xl font-bold">{result.htmlWarnings}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1"><Terminal className="w-4 h-4 text-destructive" /><span className="text-xs text-muted-foreground">Console Errors</span></div>
                  <p className="text-2xl font-bold">{result.consoleErrors}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 mb-1"><Terminal className="w-4 h-4 text-amber-500" /><span className="text-xs text-muted-foreground">Console Warnings</span></div>
                  <p className="text-2xl font-bold">{result.consoleWarnings}</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> HTML Issues</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  {result.missingTags && result.missingTags.length > 0 && <div><p className="text-xs text-muted-foreground mb-1">Missing Tags</p>{result.missingTags.map((t, i) => <Badge key={i} variant="destructive" className="mr-1 mb-1 text-xs">{t}</Badge>)}</div>}
                  {result.invalidElements && result.invalidElements.length > 0 && <div><p className="text-xs text-muted-foreground mb-1">Invalid Elements</p>{result.invalidElements.map((t, i) => <Badge key={i} variant="destructive" className="mr-1 mb-1 text-xs">{t}</Badge>)}</div>}
                  {result.duplicateIds && result.duplicateIds.length > 0 && <div><p className="text-xs text-muted-foreground mb-1">Duplicate IDs</p>{result.duplicateIds.map((id, i) => <Badge key={i} variant="secondary" className="mr-1 mb-1 text-xs">{id}</Badge>)}</div>}
                  {(!result.missingTags || result.missingTags.length === 0) && (!result.invalidElements || result.invalidElements.length === 0) && <p className="text-sm text-muted-foreground">No HTML issues detected</p>}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Layout className="w-4 h-4 text-purple-500" /> CSS Issues</CardTitle></CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between"><span className="text-sm">CSS Size</span><span className="font-medium">{formatBytes(result.cssSize ?? 0)}</span></div>
                  {result.unusedCss && result.unusedCss.length > 0 && <div><p className="text-xs text-muted-foreground mb-1">Unused CSS ({result.unusedCss.length})</p>{result.unusedCss.map((c, i) => <Badge key={i} variant="outline" className="mr-1 mb-1 text-xs">{c}</Badge>)}</div>}
                  {result.flexIssues && result.flexIssues.length > 0 && <div><p className="text-xs text-muted-foreground mb-1">Flexbox Issues</p><ul className="space-y-1">{result.flexIssues.map((issue, i) => <li key={i} className="text-xs text-destructive">• {issue}</li>)}</ul></div>}
                  {result.gridIssues && result.gridIssues.length > 0 && <div><p className="text-xs text-muted-foreground mb-1">Grid Issues</p><ul className="space-y-1">{result.gridIssues.map((issue, i) => <li key={i} className="text-xs text-destructive">• {issue}</li>)}</ul></div>}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Terminal className="w-4 h-4 text-cyan-500" /> JavaScript Issues</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm">Console Errors</span><span className="font-medium">{result.consoleErrors}</span></div>
                  <div className="flex justify-between"><span className="text-sm">Console Warnings</span><span className="font-medium">{result.consoleWarnings}</span></div>
                  <div className="flex justify-between"><span className="text-sm">Runtime Errors</span><span className="font-medium">{result.runtimeErrors}</span></div>
                  <div className="flex justify-between"><span className="text-sm">Long Tasks</span><span className="font-medium">{result.longTasks}</span></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Info className="w-4 h-4" /> Bundle Analysis</CardTitle></CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm">Bundle Size</span><span className="font-medium">{formatBytes(result.bundleSize ?? 0)}</span></div>
                  <div className="flex justify-between"><span className="text-sm">Dead Code</span><Badge variant={result.deadCode ? "destructive" : "default"}>{result.deadCode ? "Detected" : "None"}</Badge></div>
                  {result.animationPerformance && result.animationPerformance.length > 0 && <div><p className="text-xs text-muted-foreground mb-1">Animation Issues</p><ul className="space-y-1">{result.animationPerformance.map((a, i) => <li key={i} className="text-xs text-amber-500">• {a}</li>)}</ul></div>}
                </CardContent>
              </Card>
            </div>

            <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
              <CardHeader><CardTitle className="text-sm flex items-center gap-2"><ArrowUp className="w-4 h-4 text-emerald-500" /> Recommendations</CardTitle></CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {result.recommendations?.map((rec, i) => (
                    <li key={i} className="flex items-start gap-2 text-sm"><ArrowUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" /><span>{rec}</span></li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Code2 className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to analyze HTML, CSS, and JavaScript</p>
            <p className="text-sm text-muted-foreground/60">Detect code issues, console errors, and optimization opportunities</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
