"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { TabletSmartphone, Smartphone, CheckCircle, XCircle, AlertTriangle, ArrowUp } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const PLATFORMS = ["Android", "iOS", "React Native", "Expo", "Flutter"]

const TEST_AREAS = ["Installation", "Permissions", "Startup", "Deep Links", "Performance", "Crash Detection"]

function generateMockResults() {
  return TEST_AREAS.map((area) => ({
    area,
    status: (["pass", "pass", "pass", "fail", "pass"] as const)[Math.floor(Math.random() * 5)],
    details: area === "Installation" ? "APK size: 24MB" : area === "Permissions" ? "3 runtime permissions required" : area === "Startup" ? "Cold start: 1.2s" : area === "Deep Links" ? "3 deep links configured" : area === "Performance" ? "ANR rate: 0.02%" : "Crash rate: 0.01%",
  }))
}

export default function MobileTestingPage() {
  const [url, setUrl] = React.useState("")
  const [platform, setPlatform] = React.useState("Android")
  const [loading, setLoading] = React.useState(false)
  const [results, setResults] = React.useState<{ area: string; status: string; details: string }[]>([])

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResults([])
    await new Promise((r) => setTimeout(r, 2000))
    setResults(generateMockResults())
    setLoading(false)
  }

  const passCount = results.filter((r) => r.status === "pass").length
  const score = results.length > 0 ? Math.round((passCount / results.length) * 100) : 0

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Mobile Testing</h1>
        <p className="text-muted-foreground">Test mobile app installation, permissions, performance, and crash detection</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <Input placeholder="App store URL or deep link" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button onClick={runTest} disabled={loading || !url.trim()}>
              {loading ? <Smartphone className="w-4 h-4 animate-pulse" /> : <TabletSmartphone className="w-4 h-4" />}
              {loading ? "Testing..." : "Run Mobile Test"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-3">
            {Array.from({ length: 6 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
          </motion.div>
        )}

        {results.length > 0 && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="relative inline-flex items-center justify-center w-24 h-24">
                <svg width="96" height="96" className="transform -rotate-90">
                  <circle cx="48" cy="48" r="40" fill="none" stroke="currentColor" strokeWidth="8" className="text-muted/20" />
                  <circle cx="48" cy="48" r="40" fill="none" strokeWidth="8" className={score >= 80 ? "stroke-emerald-500" : score >= 50 ? "stroke-amber-500" : "stroke-red-500"} strokeLinecap="round" strokeDasharray={2 * Math.PI * 40} strokeDashoffset={2 * Math.PI * 40 - (score / 100) * 2 * Math.PI * 40} style={{ transition: "stroke-dashoffset 1s ease-in-out" }} />
                </svg>
                <span className="absolute text-xl font-bold">{score}</span>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Platform: <span className="font-medium text-foreground">{platform}</span></p>
                <p className="text-sm text-muted-foreground">{passCount}/{results.length} tests passed</p>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {results.map((r, i) => (
                <Card key={i} className={cn("backdrop-blur-xl bg-background/60 border-muted/20", r.status === "fail" ? "border-destructive/30" : "")}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium">{r.area}</span>
                      {r.status === "pass" ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                    </div>
                    <p className="text-xs text-muted-foreground">{r.details}</p>
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Smartphone className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a mobile app URL to run tests</p>
            <p className="text-sm text-muted-foreground/60">Test installation, permissions, startup time, and crash detection</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
