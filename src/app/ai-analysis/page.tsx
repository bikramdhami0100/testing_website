"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { ErrorState } from "@/components/shared/error-state"
import { Brain, Sparkles, Star, TrendingUp, Shield, Search, Eye, Code2, Zap, ArrowUp, Gauge, CheckCircle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { AiAnalysisResult } from "@/types"

function RadialScore({ score, label, size = 100, color }: { score: number; label: string; size?: number; color?: string }) {
  const r = (size - 20) / 2
  const circumference = 2 * Math.PI * r
  const offset = circumference - (score / 100) * circumference
  const strokeColor = color || (score >= 80 ? "#10b981" : score >= 50 ? "#f59e0b" : "#ef4444")

  return (
    <div className="flex flex-col items-center gap-1">
      <div className="relative inline-flex items-center justify-center" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="transform -rotate-90">
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke="currentColor" strokeWidth="6" className="text-muted/20" />
          <circle cx={size / 2} cy={size / 2} r={r} fill="none" stroke={strokeColor} strokeWidth="6" strokeLinecap="round" strokeDasharray={circumference} strokeDashoffset={offset} style={{ transition: "stroke-dashoffset 1.5s ease-in-out" }} />
        </svg>
        <span className="absolute text-lg font-bold">{score}</span>
      </div>
      <span className="text-xs text-muted-foreground">{label}</span>
    </div>
  )
}

function ScoreCard({ title, score, icon: Icon, color, suggestions }: { title: string; score: number; icon: React.ElementType; color: string; suggestions: string[] }) {
  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="backdrop-blur-xl bg-background/60 border-muted/20 h-full">
        <CardContent className="p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <Icon className={cn("w-5 h-5", color)} />
              <span className="font-medium">{title}</span>
            </div>
            <span className={cn("text-xl font-bold", color)}>{score}</span>
          </div>
          <Progress value={score} className={cn("h-2", color)} />
          {suggestions.length > 0 && (
            <ul className="mt-3 space-y-1">
              {suggestions.slice(0, 3).map((s, i) => (
                <li key={i} className="text-xs text-muted-foreground flex items-start gap-1">
                  <Info className="w-3 h-3 mt-0.5 shrink-0" />
                  <span className="line-clamp-2">{s}</span>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </motion.div>
  )
}

export default function AiAnalysisPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<AiAnalysisResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runAnalysis = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const { runPerformanceTest, runSeoTest, runAccessibilityTest, runSecurityTest, runHtmlCssJsTest } = await import("@/lib/test-engine")
      const { analyzeResults } = await import("@/lib/ai-analysis")
      const [perf, seo, a11y, sec, html] = await Promise.all([
        runPerformanceTest(url),
        runSeoTest(url),
        runAccessibilityTest(url),
        runSecurityTest(url),
        runHtmlCssJsTest(url),
      ])
      const res = await analyzeResults(url, perf, seo, a11y, sec, html, null, null, null)
      setResult(res)
    } catch (e) {
      setError(e instanceof Error ? e.message : "Analysis failed")
    } finally {
      setLoading(false)
    }
  }

  const sections = result ? [
    { title: "Performance Suggestions", icon: Zap, color: "text-blue-500", items: result.performanceSuggestions },
    { title: "Security Recommendations", icon: Shield, color: "text-red-500", items: result.securityRecommendations },
    { title: "Accessibility Suggestions", icon: Eye, color: "text-emerald-500", items: result.accessibilitySuggestions },
    { title: "SEO Improvements", icon: Search, color: "text-purple-500", items: result.seoImprovements },
    { title: "UX Review", icon: Gauge, color: "text-amber-500", items: result.uxReview },
    { title: "UI Review", icon: Code2, color: "text-cyan-500", items: result.uiReview },
    { title: "Best Practice Suggestions", icon: CheckCircle, color: "text-emerald-500", items: result.bestPracticeSuggestions },
    { title: "Optimization Recommendations", icon: TrendingUp, color: "text-orange-500", items: result.optimizationRecommendations },
  ] : []

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">AI Analysis</h1>
        <p className="text-muted-foreground">DeepSeek AI-powered analysis covering performance, security, accessibility, SEO, and quality</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4">
          <div className="flex gap-3">
            <Input
              placeholder="Enter URL (e.g. https://example.com)"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && runAnalysis()}
            />
            <Button onClick={runAnalysis} disabled={loading || !url.trim()} className="gap-2 shrink-0">
              {loading ? <Brain className="w-4 h-4 animate-pulse" /> : <Sparkles className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-6">
            <div className="flex justify-center"><Skeleton className="w-40 h-40 rounded-full" /></div>
            <div className="grid gap-4 md:grid-cols-3">{Array.from({ length: 5 }).map((_, i) => <Skeleton key={i} className="h-32 rounded-xl" />)}</div>
          </motion.div>
        )}

        {error && !loading && (
          <ErrorState message={error} onRetry={runAnalysis} />
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-8">
            <div className="flex flex-col items-center gap-4">
              <motion.div initial={{ scale: 0 }} animate={{ scale: 1 }} transition={{ type: "spring", stiffness: 100, damping: 10 }}>
                <RadialScore score={result.overallHealth} label="Overall Health" size={140} />
              </motion.div>
              <Badge variant={result.overallHealth >= 80 ? "default" : result.overallHealth >= 50 ? "secondary" : "destructive"} className="text-sm px-4 py-1">
                {result.overallHealth >= 80 ? "Excellent" : result.overallHealth >= 60 ? "Good" : result.overallHealth >= 40 ? "Fair" : "Poor"}
              </Badge>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <ScoreCard title="Performance" score={result.performanceScore} icon={Zap} color="text-blue-500" suggestions={result.performanceSuggestions} />
              <ScoreCard title="Security" score={result.securityScore} icon={Shield} color="text-red-500" suggestions={result.securityRecommendations} />
              <ScoreCard title="Accessibility" score={result.accessibilityScore} icon={Eye} color="text-emerald-500" suggestions={result.accessibilitySuggestions} />
              <ScoreCard title="SEO" score={result.seoScore} icon={Search} color="text-purple-500" suggestions={result.seoImprovements} />
              <ScoreCard title="Quality" score={result.qualityScore} icon={Code2} color="text-cyan-500" suggestions={result.bestPracticeSuggestions} />
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 flex flex-col items-center justify-center h-full">
                  <Star className="w-8 h-8 text-amber-500 mb-2" />
                  <p className="text-2xl font-bold">{result.overallHealth}</p>
                  <p className="text-xs text-muted-foreground">Overall Health</p>
                </CardContent>
              </Card>
            </div>

            <div className="space-y-6">
              {sections.map((section, i) => (
                <motion.div key={section.title} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                  <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-sm flex items-center gap-2">
                        <section.icon className={cn("w-4 h-4", section.color)} />
                        {section.title}
                        <Badge variant="outline" className="text-xs ml-2">{section.items.length}</Badge>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <ScrollArea className="h-48">
                        <ul className="space-y-2">
                          {section.items.map((item, j) => (
                            <li key={j} className="flex items-start gap-2 text-sm">
                              <ArrowUp className="w-4 h-4 text-emerald-500 mt-0.5 shrink-0" />
                              <span>{item}</span>
                            </li>
                          ))}
                        </ul>
                      </ScrollArea>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </motion.div>
        )}

        {!result && !error && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Brain className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL and run AI analysis to get started</p>
            <p className="text-sm text-muted-foreground/60">DeepSeek AI-powered analysis across performance, security, accessibility, SEO, and quality</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
