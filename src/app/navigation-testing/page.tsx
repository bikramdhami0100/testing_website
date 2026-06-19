"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Compass, Map, Link, AlertTriangle, ArrowLeftRight, Route, CheckCircle, XCircle, ArrowUp, Search, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { runNavigationTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { NavigationTestResult } from "@/types"

function BrokenNavCard({ title, icon: Icon, items, emptyMessage }: { title: string; icon: React.ElementType; items: string[]; emptyMessage: string }) {
  return (
    <Card className="backdrop-blur-xl bg-background/60 border-white/10">
      <CardHeader className="pb-2">
        <CardTitle className="text-sm flex items-center gap-2">
          <Icon className={cn("w-4 h-4", items.length > 0 ? "text-red-400" : "text-emerald-500")} />
          {title}
          {items.length > 0 && <Badge variant="destructive" className="text-xs ml-auto">{items.length}</Badge>}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {items.length > 0 ? (
          <ul className="space-y-1">
            {items.map((item, i) => (
              <li key={i} className="text-xs text-muted-foreground flex items-start gap-1 font-mono">
                <XCircle className="w-3 h-3 text-red-400 mt-0.5 shrink-0" />
                {item}
              </li>
            ))}
          </ul>
        ) : (
          <p className="text-sm text-muted-foreground flex items-center gap-2"><CheckCircle className="w-4 h-4 text-emerald-500" />{emptyMessage}</p>
        )}
      </CardContent>
    </Card>
  )
}

export default function NavigationTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<NavigationTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runNavigationTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Navigation Testing</h1>
        <p className="text-muted-foreground">Test site navigation, links, routes, and page structure</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Compass className="w-4 h-4 animate-spin" /> : <Route className="w-4 h-4" />}
            {loading ? "Running..." : "Test Navigation"}
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
            <div className="flex flex-wrap items-center gap-4">
              <div className="relative inline-flex items-center justify-center w-28 h-28">
                <svg width="112" height="112" className="transform -rotate-90">
                  <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle cx="56" cy="56" r="48" fill="none" strokeWidth="8" className={result.score >= 80 ? "stroke-emerald-500" : result.score >= 50 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 - (result.score / 100) * 2 * Math.PI * 48} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                </svg>
                <span className="absolute text-2xl font-bold">{result.score}</span>
              </div>
              <div>
                <p className="text-lg font-medium">Navigation Score</p>
                <div className="flex items-center gap-2 mt-1">
                  <Map className="w-4 h-4 text-muted-foreground" />
                  <span className="text-sm text-muted-foreground">{result.pagesTested} pages tested</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <Map className="w-8 h-8 text-blue-500" />
                  <div>
                    <p className="text-2xl font-bold">{result.pagesTested}</p>
                    <p className="text-xs text-muted-foreground">Pages Tested</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <Link className={cn("w-8 h-8", result.brokenNavigation.length > 0 ? "text-red-500" : "text-emerald-500")} />
                  <div>
                    <p className="text-2xl font-bold">{result.brokenNavigation.length}</p>
                    <p className="text-xs text-muted-foreground">Broken Links</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <AlertTriangle className={cn("w-8 h-8", result.redirectLoops.length > 0 ? "text-red-500" : "text-emerald-500")} />
                  <div>
                    <p className="text-2xl font-bold">{result.redirectLoops.length}</p>
                    <p className="text-xs text-muted-foreground">Redirect Loops</p>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4 flex items-center gap-3">
                  <XCircle className={cn("w-8 h-8", result.missingPages.length > 0 ? "text-red-500" : "text-emerald-500")} />
                  <div>
                    <p className="text-2xl font-bold">{result.missingPages.length + result.brokenButtons.length + result.missingRoutes.length}</p>
                    <p className="text-xs text-muted-foreground">Total Issues</p>
                  </div>
                </CardContent>
              </Card>
            </div>

            {result.brokenNavigation.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><ArrowLeftRight className="w-4 h-4" /> Broken Navigation</CardTitle>
                  <CardDescription>Links that failed to resolve</CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.brokenNavigation.map((entry, i) => (
                    <div key={i} className="flex items-start gap-3 p-2 rounded-lg bg-muted/30 text-sm">
                      <XCircle className="w-4 h-4 text-red-400 mt-0.5 shrink-0" />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-xs font-mono text-muted-foreground">{entry.from}</span>
                          <ArrowUp className="w-3 h-3 rotate-90 text-muted-foreground shrink-0" />
                          <span className="text-xs font-mono text-muted-foreground">{entry.to}</span>
                          <Badge variant="destructive" className="text-xs">{entry.error}</Badge>
                        </div>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <BrokenNavCard title="Redirect Loops" icon={AlertTriangle} items={result.redirectLoops} emptyMessage="No redirect loops detected" />
              <BrokenNavCard title="Missing Pages" icon={Compass} items={result.missingPages} emptyMessage="No missing pages" />
              <BrokenNavCard title="Broken Buttons" icon={ExternalLink} items={result.brokenButtons} emptyMessage="All buttons functional" />
              <BrokenNavCard title="Missing Routes" icon={Search} items={result.missingRoutes} emptyMessage="All routes resolved" />
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
            <Compass className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to test site navigation</p>
            <p className="text-sm text-muted-foreground/60">Check for broken links, redirect loops, missing pages, and route issues</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
