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
import { Search, Link, FileText, Image as ImageIcon, List, Globe, MessageCircle, CheckCircle, XCircle, ArrowUp, ArrowDown, AlertTriangle, Info } from "lucide-react"
import { cn } from "@/lib/utils"
import { runSeoTest } from "@/lib/test-engine"
import { addRecentUrl } from "@/lib/storage"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { SeoResult } from "@/types"

function ScoreBadge({ score }: { score: number }) {
  const color = score >= 90 ? "bg-emerald-500/10 text-emerald-500 border-emerald-500/20" : score >= 70 ? "bg-amber-500/10 text-amber-500 border-amber-500/20" : "bg-red-500/10 text-red-500 border-red-500/20"
  return (
    <div className={cn("inline-flex items-center gap-2 px-4 py-2 rounded-full border", color)}>
      <span className="text-2xl font-bold">{score}</span>
      <span className="text-sm">/ 100</span>
    </div>
  )
}

export default function SeoPage() {
  const [url, setUrl] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<SeoResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const runTest = async () => {
    if (!url.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      addRecentUrl(url)
      const res = await runSeoTest(url)
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
        <h1 className="text-3xl font-bold tracking-tight">SEO Analysis</h1>
        <p className="text-muted-foreground">Comprehensive search engine optimization audit and recommendations</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 flex gap-3">
          <Input placeholder="Enter URL (e.g. https://example.com)" value={url} onChange={(e) => setUrl(e.target.value)} onKeyDown={(e) => e.key === "Enter" && runTest()} className="flex-1" />
          <Button onClick={runTest} disabled={loading || !url.trim()}>
            {loading ? <Search className="w-4 h-4 animate-pulse" /> : <Search className="w-4 h-4" />}
            {loading ? "Running..." : "Run SEO Test"}
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
              <ScoreBadge score={result.score ?? 0} />
              <div className="flex-1">
                <Progress value={result.score ?? 0} className="h-3" />
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Meta Title</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.title ? (
                    <div>
                      <p className="text-sm font-medium truncate">{result.title}</p>
                      <div className="text-xs text-muted-foreground mt-1">Length: {result.titleLength} chars {result.titleLength && result.titleLength > 60 ? <Badge variant="destructive" className="ml-1 text-xs">Too long</Badge> : result.titleLength && result.titleLength < 10 ? <Badge variant="destructive" className="ml-1 text-xs">Too short</Badge> : <Badge variant="default" className="ml-1 text-xs">Good</Badge>}</div>
                    </div>
                  ) : <p className="text-sm text-destructive">Missing title tag</p>}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><FileText className="w-4 h-4" /> Meta Description</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.description ? (
                    <div>
                      <p className="text-sm line-clamp-2">{result.description}</p>
                      <div className="text-xs text-muted-foreground mt-1">Length: {result.descriptionLength} chars {result.descriptionLength && result.descriptionLength > 160 ? <Badge variant="destructive" className="ml-1 text-xs">Too long</Badge> : result.descriptionLength && result.descriptionLength < 50 ? <Badge variant="secondary" className="ml-1 text-xs">Too short</Badge> : <Badge variant="default" className="ml-1 text-xs">Good</Badge>}</div>
                    </div>
                  ) : <p className="text-sm text-destructive">Missing meta description</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><Globe className="w-4 h-4" /> Canonical URL</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.canonical ? <p className="text-xs font-mono truncate">{result.canonical}</p> : <p className="text-sm text-destructive">Not set</p>}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Open Graph</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.ogTags && Object.keys(result.ogTags).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(result.ogTags).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs"><span className="text-muted-foreground shrink-0">{k}:</span><span className="truncate">{v}</span></div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-destructive">Not configured</p>}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><MessageCircle className="w-4 h-4" /> Twitter Cards</CardTitle>
                </CardHeader>
                <CardContent>
                  {result.twitterCards && Object.keys(result.twitterCards).length > 0 ? (
                    <div className="space-y-1">
                      {Object.entries(result.twitterCards).map(([k, v]) => (
                        <div key={k} className="flex gap-2 text-xs"><span className="text-muted-foreground shrink-0">{k}:</span><span className="truncate">{v}</span></div>
                      ))}
                    </div>
                  ) : <p className="text-sm text-destructive">Not configured</p>}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Robots.txt &amp; Sitemap</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm">Robots.txt</span><Badge variant={result.robotsTxt ? "default" : "destructive"}>{result.robotsTxt ? "Found" : "Missing"}</Badge></div>
                  <div className="flex justify-between"><span className="text-sm">XML Sitemap</span><Badge variant={result.sitemapXml ? "default" : "destructive"}>{result.sitemapXml ? "Found" : "Missing"}</Badge></div>
                  <div className="flex justify-between"><span className="text-sm">Duplicate Content</span><Badge variant={result.duplicateContent ? "destructive" : "default"}>{result.duplicateContent ? "Detected" : "None"}</Badge></div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><List className="w-4 h-4" /> Links</CardTitle>
                </CardHeader>
                <CardContent className="space-y-2">
                  <div className="flex justify-between"><span className="text-sm">Internal Links</span><span className="font-medium">{result.internalLinks}</span></div>
                  <div className="flex justify-between"><span className="text-sm">External Links</span><span className="font-medium">{result.externalLinks}</span></div>
                  <div className="flex justify-between"><span className="text-sm">Broken Links</span><Badge variant={result.brokenLinks && result.brokenLinks.length > 0 ? "destructive" : "default"}>{result.brokenLinks?.length ?? 0}</Badge></div>
                </CardContent>
              </Card>
            </div>

            {result.brokenLinks && result.brokenLinks.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20 border-destructive/30">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><XCircle className="w-4 h-4 text-destructive" /> Broken Links</CardTitle>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.brokenLinks.map((link, i) => (
                      <li key={i} className="text-xs text-destructive font-mono">{link}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}

            {result.structuredData && result.structuredData.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><List className="w-4 h-4" /> Structured Data</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {result.structuredData.map((sd, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm">
                        <Badge variant={sd.valid ? "default" : "destructive"} className="text-xs">{sd.valid ? "Valid" : "Invalid"}</Badge>
                        <span>{sd.type}</span>
                        {sd.errors && sd.errors.length > 0 && <span className="text-xs text-destructive">({sd.errors.join(", ")})</span>}
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.headingStructure && result.headingStructure.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><List className="w-4 h-4" /> Heading Structure</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {result.headingStructure.map((h, i) => (
                      <div key={i} className="flex items-center gap-2 text-sm" style={{ paddingLeft: `${(h.level - 1) * 16}px` }}>
                        <Badge variant="outline" className="text-xs font-mono">H{h.level}</Badge>
                        <span>{h.text}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {result.altAttributes && result.altAttributes.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm flex items-center gap-2"><ImageIcon className="w-4 h-4" /> Alt Attributes</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-1">
                    {result.altAttributes.map((alt, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs">
                        {alt.hasAlt ? <CheckCircle className="w-3 h-3 text-emerald-500" /> : <XCircle className="w-3 h-3 text-destructive" />}
                        <span className="font-mono truncate">{alt.src}</span>
                        {alt.altText && <span className="text-muted-foreground truncate">- {alt.altText}</span>}
                      </div>
                    ))}
                  </div>
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
            <Search className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter a URL to run an SEO analysis</p>
            <p className="text-sm text-muted-foreground/60">Check meta tags, structured data, links, and more</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
