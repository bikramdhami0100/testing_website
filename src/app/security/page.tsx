"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Shield, Lock, Server, Key, CheckCircle, XCircle, AlertTriangle, ArrowUp, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { runSecurityTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { SecurityResult } from "@/types"

const severityColors: Record<string, string> = {
  critical: "bg-red-500/10 text-red-500 border-red-500/30",
  high: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  medium: "bg-amber-500/10 text-amber-500 border-amber-500/30",
  low: "bg-blue-500/10 text-blue-500 border-blue-500/30",
}

export default function SecurityPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<SecurityResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runSecurityTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">Security Test</h1>
        <p className="text-muted-foreground">Security headers, SSL/TLS configuration, and vulnerability scanning</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Shield className="w-4 h-4 animate-pulse" /> : <Shield className="w-4 h-4" />}
            {loading ? "Running..." : "Run Security Test"}
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
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Shield className="w-4 h-4" /> Security Headers</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.headers && Object.entries(result.headers).map(([key, val]) => (
                    <div key={key} className="flex items-center justify-between">
                      <span className="text-sm font-mono">{key.replace(/([A-Z])/g, "-$1").toLowerCase().replace(/^-/, "")}</span>
                      {val ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
                    </div>
                  ))}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Lock className="w-4 h-4" /> SSL/TLS</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  {result.ssl && (
                    <>
                      <div className="flex justify-between"><span className="text-sm">Valid</span><Badge variant={result.ssl.valid ? "default" : "destructive"}>{result.ssl.valid ? "Yes" : "No"}</Badge></div>
                      <div className="flex justify-between"><span className="text-sm">Issuer</span><span className="text-sm font-medium">{result.ssl.issuer}</span></div>
                      <div className="flex justify-between"><span className="text-sm">Expiry</span><span className="text-sm">{formatDate(new Date(result.ssl.expiryDate ?? "").getTime())}</span></div>
                      <div className="flex justify-between"><span className="text-sm">TLS Version</span><span className="text-sm font-medium">{result.ssl.tlsVersion}</span></div>
                      <div className="flex justify-between"><span className="text-sm">Weak Cipher</span><Badge variant={result.ssl.weakCipher ? "destructive" : "default"}>{result.ssl.weakCipher ? "Detected" : "None"}</Badge></div>
                      <div className="flex justify-between"><span className="text-sm">Mixed Content</span><Badge variant={result.ssl.mixedContent ? "destructive" : "default"}>{result.ssl.mixedContent ? "Detected" : "None"}</Badge></div>
                    </>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Key className="w-4 h-4" /> Authentication Security</CardTitle>
              </CardHeader>
              <CardContent>
                {result.authentication && (
                  <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                    {Object.entries(result.authentication).map(([key, val]) => (
                      <div key={key} className="flex items-center justify-between p-2 rounded-lg bg-muted/30">
                        <span className="text-sm">{key.replace(/([A-Z])/g, " $1").replace(/^./, (s) => s.toUpperCase())}</span>
                        {val ? <CheckCircle className="w-4 h-4 text-emerald-500" /> : <XCircle className="w-4 h-4 text-destructive" />}
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            {result.vulnerabilities && result.vulnerabilities.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4 text-destructive" /> Vulnerabilities ({result.vulnerabilities.length})</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  {result.vulnerabilities.map((v, i) => (
                    <div key={i} className="p-3 rounded-lg bg-muted/30 space-y-1">
                      <div className="flex items-center gap-2">
                        <Badge className={cn("text-xs", severityColors[v.severity])}>{v.severity}</Badge>
                        <span className="text-sm font-medium">{v.type}</span>
                      </div>
                      <p className="text-xs text-muted-foreground">{v.description}</p>
                      <p className="text-xs text-emerald-500">{v.recommendation}</p>
                    </div>
                  ))}
                </CardContent>
              </Card>
            )}

            <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
              <CardHeader>
                <CardTitle className="text-sm flex items-center gap-2"><ArrowUp className="w-4 h-4 text-emerald-500" /> Recommendations</CardTitle>
              </CardHeader>
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
            <Shield className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to run a security audit</p>
            <p className="text-sm text-muted-foreground/60">Check security headers, SSL configuration, and vulnerabilities</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
