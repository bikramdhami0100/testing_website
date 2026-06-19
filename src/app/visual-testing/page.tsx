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
import { Image, Sun, Moon, Monitor, CheckCircle, XCircle, AlertTriangle, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { runVisualTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { VisualTestResult } from "@/types"

export default function VisualTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<VisualTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runVisualTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Visual Testing</h1>
        <p className="text-muted-foreground">Screenshot comparison, layout shift detection, and theme validation</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Image className="w-4 h-4 animate-pulse" /> : <Image className="w-4 h-4" />}
            {loading ? "Running..." : "Run Visual Test"}
          </Button>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 3 }).map((_, i) => <Skeleton key={i} className="h-40 rounded-xl" />)}
          </motion.div>
        )}

        {error && !loading && (
          <ErrorState message={error} onRetry={runTest} />
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <Monitor className="w-10 h-10 mx-auto mb-2 text-blue-500" />
                  <p className="text-2xl font-bold">{result.screenshots?.length ?? 0}</p>
                  <p className="text-xs text-muted-foreground">Screenshots Captured</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <AlertTriangle className="w-10 h-10 mx-auto mb-2 text-amber-500" />
                  <p className="text-2xl font-bold">{result.layoutShift?.toFixed(3)}</p>
                  <p className="text-xs text-muted-foreground">Layout Shift Score</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  {result.visualRegression ? <XCircle className="w-10 h-10 mx-auto mb-2 text-destructive" /> : <CheckCircle className="w-10 h-10 mx-auto mb-2 text-emerald-500" />}
                  <p className="text-lg font-bold">{result.visualRegression ? "Regression Detected" : "No Regression"}</p>
                  <p className="text-xs text-muted-foreground">Visual Regression Status</p>
                </CardContent>
              </Card>
            </div>

            {result.screenshots && result.screenshots.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader><CardTitle className="text-sm flex items-center gap-2"><Monitor className="w-4 h-4" /> Screenshots</CardTitle></CardHeader>
                <CardContent>
                  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                    {result.screenshots.map((ss, i) => (
                      <div key={i} className="rounded-lg bg-muted/30 p-4 text-center">
                        <div className="w-full aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-md mb-2 flex items-center justify-center">
                          <Image className="w-8 h-8 text-muted-foreground/40" />
                        </div>
                        <p className="text-sm font-medium">{ss.name}</p>
                        <p className="text-xs text-muted-foreground">{ss.width}x{ss.height}</p>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.themeComparison && (
              <div className="grid gap-4 md:grid-cols-2">
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Sun className="w-6 h-6 text-amber-500" />
                      <span className="font-medium">Light Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={result.themeComparison.lightScore * 100} className="flex-1" />
                      <span className="text-sm font-bold">{(result.themeComparison.lightScore * 100).toFixed(0)}%</span>
                    </div>
                  </CardContent>
                </Card>
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3 mb-3">
                      <Moon className="w-6 h-6 text-indigo-400" />
                      <span className="font-medium">Dark Mode</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Progress value={result.themeComparison.darkScore * 100} className="flex-1" />
                      <span className="text-sm font-bold">{(result.themeComparison.darkScore * 100).toFixed(0)}%</span>
                    </div>
                  </CardContent>
                </Card>
              </div>
            )}

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">Dark Mode Valid</span>
                  <Badge variant={result.darkModeValid ? "default" : "destructive"}>{result.darkModeValid ? "Valid" : "Invalid"}</Badge>
                </CardContent>
              </Card>
              {result.themeComparison && (
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 flex items-center justify-between">
                    <span className="text-sm">Visual Differences</span>
                    <span className="text-lg font-bold">{result.themeComparison.differences}</span>
                  </CardContent>
                </Card>
              )}
            </div>
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Image className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to run visual tests</p>
            <p className="text-sm text-muted-foreground/60">Capture screenshots, detect layout shifts, and validate themes</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
