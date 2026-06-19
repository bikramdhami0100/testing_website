"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Progress } from "@/components/ui/progress"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Separator } from "@/components/ui/separator"
import { FileText, Download, Eye, BarChart3, Trash2, Calendar, Globe, Search } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatDate } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface SavedReport {
  id: string
  url: string
  date: number
  overallScore: number
  testTypes: string[]
  data: Record<string, unknown>
}

export default function ReportsPage() {
  const [reports, setReports] = React.useState<SavedReport[]>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("saved-reports") ?? "[]") } catch { return [] }
    }
    return []
  })
  const [selectedReport, setSelectedReport] = React.useState<SavedReport | null>(null)

  React.useEffect(() => {
    localStorage.setItem("saved-reports", JSON.stringify(reports))
  }, [reports])

  const deleteReport = (id: string) => setReports(reports.filter((r) => r.id !== id))
  const clearAll = () => setReports([])

  const exportReport = (report: SavedReport, format: "json" | "csv" | "html") => {
    let content = ""
    let ext = format
    let mime = "text/plain"
    if (format === "json") {
      content = JSON.stringify(report, null, 2)
      mime = "application/json"
    } else if (format === "csv") {
      content = "url,date,score\n" + `${report.url},${new Date(report.date).toISOString()},${report.overallScore}`
      mime = "text/csv"
    } else {
      content = `<!DOCTYPE html><html><head><title>Report - ${report.url}</title></head><body><h1>Test Report</h1><p>URL: ${report.url}</p><p>Date: ${new Date(report.date).toLocaleString()}</p><p>Score: ${report.overallScore}</p><p>Tests: ${report.testTypes.join(", ")}</p></body></html>`
      mime = "text/html"
    }
    const blob = new Blob([content], { type: mime })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `report-${report.id.slice(0, 8)}.${ext}`; a.click()
    URL.revokeObjectURL(url)
  }

  const avgScore = reports.length > 0 ? Math.round(reports.reduce((s, r) => s + r.overallScore, 0) / reports.length) : 0
  const bestScore = reports.length > 0 ? Math.max(...reports.map((r) => r.overallScore)) : 0
  const worstScore = reports.length > 0 ? Math.min(...reports.map((r) => r.overallScore)) : 0

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Reports</h1>
        <p className="text-muted-foreground">View, export, and manage your saved test reports</p>
      </div>

      {reports.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <FileText className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">No saved reports yet</p>
          <p className="text-sm text-muted-foreground/60">Run tests and save reports to see them here</p>
        </div>
      ) : selectedReport ? (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-6">
          <Button variant="outline" onClick={() => setSelectedReport(null)} className="gap-2"><Eye className="w-4 h-4" /> Back to Reports</Button>

          <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">{selectedReport.url}</CardTitle>
                  <CardDescription>{formatDate(selectedReport.date)}</CardDescription>
                </div>
                <Badge variant={selectedReport.overallScore >= 80 ? "default" : selectedReport.overallScore >= 50 ? "secondary" : "destructive"} className="text-lg px-4 py-1">{selectedReport.overallScore}</Badge>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <p className="text-sm font-medium mb-2">Test Types</p>
                <div className="flex flex-wrap gap-2">
                  {selectedReport.testTypes.map((t) => <Badge key={t} variant="outline">{t}</Badge>)}
                </div>
              </div>
              <Separator />
              <div>
                <p className="text-sm font-medium mb-2">Actions</p>
                <div className="flex gap-2">
                  <Button size="sm" variant="outline" onClick={() => exportReport(selectedReport, "json")}><Download className="w-3 h-3" /> JSON</Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport(selectedReport, "csv")}><Download className="w-3 h-3" /> CSV</Button>
                  <Button size="sm" variant="outline" onClick={() => exportReport(selectedReport, "html")}><Download className="w-3 h-3" /> HTML</Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      ) : (
        <div className="space-y-6">
          {reports.length > 1 && (
            <div className="grid gap-4 md:grid-cols-3">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-emerald-500">{avgScore}</p>
                  <p className="text-xs text-muted-foreground">Average Score</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-blue-500">{bestScore}</p>
                  <p className="text-xs text-muted-foreground">Best Score</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-2xl font-bold text-destructive">{worstScore}</p>
                  <p className="text-xs text-muted-foreground">Worst Score</p>
                </CardContent>
              </Card>
            </div>
          )}

          <div className="flex items-center justify-between">
            <p className="text-sm text-muted-foreground">{reports.length} report{reports.length !== 1 ? "s" : ""}</p>
            <Button variant="destructive" size="sm" onClick={clearAll}><Trash2 className="w-3 h-3" /> Clear All</Button>
          </div>

          <div className="space-y-3">
            {reports.map((report, i) => (
              <motion.div key={report.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Globe className="w-4 h-4 text-muted-foreground shrink-0" />
                          <p className="text-sm font-medium truncate">{report.url}</p>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-muted-foreground">
                          <span className="flex items-center gap-1"><Calendar className="w-3 h-3" />{formatDate(report.date)}</span>
                          <span className="flex items-center gap-1"><BarChart3 className="w-3 h-3" />Score: {report.overallScore}</span>
                        </div>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {report.testTypes.map((t) => <Badge key={t} variant="secondary" className="text-xs">{t}</Badge>)}
                        </div>
                      </div>
                      <div className="flex gap-1 shrink-0">
                        <Button variant="ghost" size="icon" onClick={() => setSelectedReport(report)} className="h-8 w-8"><Eye className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => exportReport(report, "json")} className="h-8 w-8"><Download className="w-4 h-4" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteReport(report.id)} className="h-8 w-8"><Trash2 className="w-4 h-4 text-destructive" /></Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      )}
    </DashboardShell>
  )
}
