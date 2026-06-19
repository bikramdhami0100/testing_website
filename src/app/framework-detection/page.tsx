"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Code2, Globe, Server, Wrench, Monitor, Smartphone, Package, Database, Share2, Shield, Zap, Layers } from "lucide-react"
import { cn } from "@/lib/utils"
import { runFrameworkDetection } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { FrameworkDetectionResult, FrameworkInfo } from "@/types"

const categoryIcons: Record<string, React.ElementType> = {
  frontend: Globe,
  backend: Server,
  cms: Database,
  mobile: Smartphone,
  desktop: Monitor,
  api: Share2,
}

const categoryColors: Record<string, string> = {
  frontend: "bg-blue-500/10 text-blue-500 border-blue-500/30",
  backend: "bg-emerald-500/10 text-emerald-500 border-emerald-500/30",
  cms: "bg-purple-500/10 text-purple-500 border-purple-500/30",
  mobile: "bg-orange-500/10 text-orange-500 border-orange-500/30",
  desktop: "bg-cyan-500/10 text-cyan-500 border-cyan-500/30",
  api: "bg-rose-500/10 text-rose-500 border-rose-500/30",
}

export default function FrameworkDetectionPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<FrameworkDetectionResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runFrameworkDetection(url)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Test failed')
    } finally {
      setLoading(false)
    }
  }

  const groupedFrameworks = result?.frameworks?.reduce(
    (acc, fw) => {
      if (!acc[fw.category]) acc[fw.category] = []
      acc[fw.category].push(fw)
      return acc
    },
    {} as Record<string, FrameworkInfo[]>
  )

  const categoryOrder = ["frontend", "backend", "cms", "mobile", "desktop", "api"]

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Framework Detection</h1>
        <p className="text-muted-foreground">Detect technologies, frameworks, and infrastructure used by any website</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Code2 className="w-4 h-4 animate-pulse" /> : <Code2 className="w-4 h-4" />}
            {loading ? "Detecting..." : "Detect Frameworks"}
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {result.language && (
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Code2 className="w-8 h-8 text-blue-500" />
                    <div><p className="text-sm text-muted-foreground">Language</p><p className="font-medium">{result.language}</p></div>
                  </CardContent>
                </Card>
              )}
              {result.runtime && (
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Zap className="w-8 h-8 text-amber-500" />
                    <div><p className="text-sm text-muted-foreground">Runtime</p><p className="font-medium">{result.runtime}</p></div>
                  </CardContent>
                </Card>
              )}
              {result.buildTool && (
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Wrench className="w-8 h-8 text-purple-500" />
                    <div><p className="text-sm text-muted-foreground">Build Tool</p><p className="font-medium">{result.buildTool}</p></div>
                  </CardContent>
                </Card>
              )}
              {result.packageManager && (
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Package className="w-8 h-8 text-emerald-500" />
                    <div><p className="text-sm text-muted-foreground">Package Manager</p><p className="font-medium">{result.packageManager}</p></div>
                  </CardContent>
                </Card>
              )}
              {result.server && (
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4 flex items-center gap-3">
                    <Server className="w-8 h-8 text-cyan-500" />
                    <div><p className="text-sm text-muted-foreground">Server</p><p className="font-medium">{result.server}</p></div>
                  </CardContent>
                </Card>
              )}
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 flex items-center gap-3">
                  <Layers className="w-8 h-8 text-rose-500" />
                  <div><p className="text-sm text-muted-foreground">Rendering</p><p className="font-medium uppercase">{result.renderingMode}</p></div>
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">HTTP Version</span><Badge variant="outline">{result.httpVersion}</Badge>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">SSL</span><Badge variant={result.ssl ? "default" : "destructive"}>{result.ssl ? "Enabled" : "Disabled"}</Badge>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 flex items-center justify-between">
                  <span className="text-sm">Compression</span><Badge variant={result.compression ? "default" : "destructive"}>{result.compression ? "Enabled" : "Disabled"}</Badge>
                </CardContent>
              </Card>
            </div>

            {groupedFrameworks && Object.keys(groupedFrameworks).length > 0 && (
              <div className="space-y-6">
                {categoryOrder
                  .filter((cat) => groupedFrameworks[cat])
                  .map((category) => {
                    const Icon = categoryIcons[category] || Globe
                    return (
                      <div key={category}>
                        <div className="flex items-center gap-2 mb-3">
                          <Icon className={cn("w-4 h-4", categoryColors[category]?.split(" ")[1] ?? "text-muted-foreground")} />
                          <h2 className="text-lg font-semibold capitalize">{category}</h2>
                        </div>
                        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
                          {groupedFrameworks[category].map((fw, i) => (
                            <Card key={i} className="backdrop-blur-xl bg-background/60 border-muted/20">
                              <CardContent className="p-4 flex items-center justify-between">
                                <div>
                                  <p className="font-medium">{fw.name}</p>
                                  {fw.version && <p className="text-xs text-muted-foreground">v{fw.version}</p>}
                                </div>
                                <Badge variant={fw.confidence >= 0.9 ? "default" : "secondary"} className="text-xs">
                                  {(fw.confidence * 100).toFixed(0)}%
                                </Badge>
                              </CardContent>
                            </Card>
                          ))}
                        </div>
                      </div>
                    )
                  })}
              </div>
            )}
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Code2 className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to detect frameworks and technologies</p>
            <p className="text-sm text-muted-foreground/60">Identify frontend, backend frameworks, CMS, and infrastructure details</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
