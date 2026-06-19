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
import { Monitor, Computer, CheckCircle, XCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const PLATFORMS = ["Electron", "Tauri"]
const TEST_AREAS = ["Installation", "Startup", "Performance", "Responsiveness"]

function generateMockResults() {
  return TEST_AREAS.map((area) => ({
    area,
    status: (["pass", "pass", "pass", "fail"] as const)[Math.floor(Math.random() * 4)],
    details: area === "Installation" ? "Installer size: 64MB" : area === "Startup" ? "Cold start: 0.8s" : area === "Performance" ? "Memory: 120MB" : "UI frame rate: 58fps",
  }))
}

export default function DesktopTestingPage() {
  const [url, setUrl] = React.useState("")
  const [platform, setPlatform] = React.useState("Electron")
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
        <h1 className="text-3xl font-bold tracking-tight">Desktop Testing</h1>
        <p className="text-muted-foreground">Test desktop app installation, startup, performance, and responsiveness</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <Input placeholder="Download URL or package name" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Select value={platform} onValueChange={setPlatform}>
              <SelectTrigger className="w-40"><SelectValue /></SelectTrigger>
              <SelectContent>
                {PLATFORMS.map((p) => (<SelectItem key={p} value={p}>{p}</SelectItem>))}
              </SelectContent>
            </Select>
            <Button onClick={runTest} disabled={loading || !url.trim()}>
              {loading ? <Monitor className="w-4 h-4 animate-pulse" /> : <Computer className="w-4 h-4" />}
              {loading ? "Testing..." : "Run Desktop Test"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="grid gap-4 md:grid-cols-2">
            {Array.from({ length: 4 }).map((_, i) => <Skeleton key={i} className="h-20 rounded-xl" />)}
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

            <div className="grid gap-4 md:grid-cols-2">
              {results.map((r, i) => (
                <Card key={i} className={cn("backdrop-blur-xl bg-background/60 border-muted/20", r.status === "fail" ? "border-destructive/30" : "")}>
                  <CardContent className="p-4 flex items-center justify-between">
                    <div>
                      <p className="text-sm font-medium">{r.area}</p>
                      <p className="text-xs text-muted-foreground">{r.details}</p>
                    </div>
                    {r.status === "pass" ? <CheckCircle className="w-5 h-5 text-emerald-500" /> : <XCircle className="w-5 h-5 text-destructive" />}
                  </CardContent>
                </Card>
              ))}
            </div>
          </motion.div>
        )}

        {results.length === 0 && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Monitor className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a desktop app URL to run tests</p>
            <p className="text-sm text-muted-foreground/60">Test installation, startup performance, and responsiveness</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
