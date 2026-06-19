"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Lock, Key, LogIn, UserCheck, Shield, Cookie, CheckCircle, XCircle, ArrowUp, Clock, Route } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTime } from "@/lib/utils"
import { runLoginTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { LoginTestResult } from "@/types"

export default function LoginTestingPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<LoginTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runLoginTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Login Testing</h1>
        <p className="text-muted-foreground">Test authentication flow, session management, and security</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com/login)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Lock className="w-4 h-4 animate-pulse" /> : <LogIn className="w-4 h-4" />}
            {loading ? "Running..." : "Test Login"}
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
                <p className="text-lg font-medium">Login Security Score</p>
                <div className="flex items-center gap-2 mt-1">
                  {result.loginSuccess ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  <span className="text-sm">{result.loginSuccess ? "Login Available" : "Login Failed"}</span>
                </div>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Clock className="w-4 h-4" /> Auth Speed</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center gap-3 mb-3">
                    <Clock className={cn("w-8 h-8", result.authSpeed <= 1000 ? "text-emerald-500" : result.authSpeed <= 2000 ? "text-amber-500" : "text-red-500")} />
                    <div>
                      <p className="text-2xl font-bold">{formatTime(result.authSpeed)}</p>
                      <p className="text-xs text-muted-foreground">Response time</p>
                    </div>
                  </div>
                  <Progress value={Math.max(0, 100 - (result.authSpeed / 30))} className="h-2" />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Route className="w-4 h-4" /> Redirect Path</CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs text-muted-foreground mb-2">Redirect chain:</p>
                  <div className="space-y-1">
                    {result.redirects.map((r, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        <span className="w-5 h-5 rounded-full bg-muted/30 flex items-center justify-center text-muted-foreground">{i + 1}</span>
                        <span className="font-mono">{r}</span>
                        {i < result.redirects.length - 1 && <ArrowUp className="w-3 h-3 rotate-90 text-muted-foreground" />}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Validation Status</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2"><UserCheck className="w-4 h-4" /> Session</span>
                    {result.sessionCreated ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2"><Cookie className="w-4 h-4" /> Cookie</span>
                    {result.cookieCreated ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm flex items-center gap-2"><Key className="w-4 h-4" /> Token</span>
                    {result.tokenValidated ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-red-500" />}
                  </div>
                </CardContent>
              </Card>
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
            <Lock className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a login URL to test authentication</p>
            <p className="text-sm text-muted-foreground/60">Validate login flow, session management, and security configuration</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
