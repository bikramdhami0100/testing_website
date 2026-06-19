"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from "@/components/ui/select"
import { FlaskConical, Beaker, GitBranch, Puzzle, Workflow, ListChecks, Search, CheckCircle, XCircle, SkipForward, Clock, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { runFunctionalTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { FunctionalTestResult, FunctionalTestCase } from "@/types"

const testTypes = [
  { value: "smoke", label: "Smoke", icon: Beaker },
  { value: "sanity", label: "Sanity", icon: FlaskConical },
  { value: "regression", label: "Regression", icon: GitBranch },
  { value: "integration", label: "Integration", icon: Puzzle },
  { value: "system", label: "System", icon: Workflow },
  { value: "e2e", label: "E2E", icon: ListChecks },
  { value: "workflow", label: "Workflow", icon: Workflow },
  { value: "business-logic", label: "Business Logic", icon: GitBranch },
  { value: "navigation", label: "Navigation", icon: FlaskConical },
  { value: "form-validation", label: "Form Validation", icon: Beaker },
  { value: "search", label: "Search", icon: Search },
] as const

function TestCaseRow({ tc }: { tc: FunctionalTestCase }) {
  const Icon = tc.status === "pass" ? CheckCircle : tc.status === "fail" ? XCircle : SkipForward
  const statusColor = tc.status === "pass" ? "text-emerald-500" : tc.status === "fail" ? "text-red-500" : "text-amber-500"
  return (
    <div className="flex items-start gap-3 p-3 rounded-lg bg-muted/30">
      <Icon className={cn("w-5 h-5 mt-0.5 shrink-0", statusColor)} />
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-mono text-muted-foreground">{tc.id}</span>
          <span className="text-sm font-medium">{tc.name}</span>
          <Badge variant={tc.status === "pass" ? "default" : tc.status === "fail" ? "destructive" : "secondary"} className="text-xs">{tc.status}</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-0.5">{tc.description}</p>
        <div className="flex items-center gap-3 mt-1">
          <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{tc.duration.toFixed(0)}ms</span>
        </div>
        {tc.error && <p className="text-xs text-red-400 mt-1">{tc.error}</p>}
      </div>
    </div>
  )
}

export default function FunctionalTestingPage() {
  const [url, setUrl] = React.useState("")
  const [testType, setTestType] = React.useState<string>("smoke")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<FunctionalTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runFunctionalTest(url, testType as FunctionalTestResult["testType"])
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
        <h1 className="text-3xl font-bold tracking-tight">Functional Testing</h1>
        <p className="text-muted-foreground">Run functional test suites to verify application behavior</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-white/10">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Select value={testType} onValueChange={setTestType}>
            <SelectTrigger className="w-44">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {testTypes.map((t) => (
                <SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Beaker className="w-4 h-4 animate-spin" /> : <FlaskConical className="w-4 h-4" />}
            {loading ? "Running..." : "Run Functional Tests"}
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
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-white/10 flex items-center justify-center p-6">
                <div className="text-center">
                  <div className="relative inline-flex items-center justify-center w-28 h-28">
                    <svg width="112" height="112" className="transform -rotate-90">
                      <circle cx="56" cy="56" r="48" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                      <circle cx="56" cy="56" r="48" fill="none" strokeWidth="8" className={result.score >= 80 ? "stroke-emerald-500" : result.score >= 50 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" strokeDasharray={2 * Math.PI * 48} strokeDashoffset={2 * Math.PI * 48 - (result.score / 100) * 2 * Math.PI * 48} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                    </svg>
                    <span className="absolute text-2xl font-bold">{result.score}</span>
                  </div>
                  <p className="text-sm text-muted-foreground mt-2">Score</p>
                </div>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <CheckCircle className="w-8 h-8 text-emerald-500" />
                    <div>
                      <p className="text-2xl font-bold">{result.passed}</p>
                      <p className="text-xs text-muted-foreground">Passed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <XCircle className="w-8 h-8 text-red-500" />
                    <div>
                      <p className="text-2xl font-bold">{result.failed}</p>
                      <p className="text-xs text-muted-foreground">Failed</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-white/10">
                <CardContent className="p-4">
                  <div className="flex items-center gap-3">
                    <SkipForward className="w-8 h-8 text-amber-500" />
                    <div>
                      <p className="text-2xl font-bold">{result.totalTests - result.passed - result.failed}</p>
                      <p className="text-xs text-muted-foreground">Skipped</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card className="backdrop-blur-xl bg-background/60 border-white/10">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2"><Beaker className="w-4 h-4" /> Progress</CardTitle>
              </CardHeader>
              <CardContent>
                <Progress value={result.score} className="h-3" />
                <p className="text-xs text-muted-foreground mt-1">{result.passed + result.failed} of {result.totalTests} tests completed</p>
              </CardContent>
            </Card>

            <div className="space-y-3">
              <h2 className="text-lg font-semibold flex items-center gap-2"><ListChecks className="w-5 h-5" /> Test Cases ({result.totalTests})</h2>
              <div className="grid gap-2">
                {result.testCases.map((tc) => <TestCaseRow key={tc.id} tc={tc} />)}
              </div>
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
            <FlaskConical className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL and select a test type</p>
            <p className="text-sm text-muted-foreground/60">Run functional tests to validate application behavior</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
