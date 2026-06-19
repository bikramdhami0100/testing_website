"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Bot, MousePointer, Keyboard, Play, Trash2, Clock, Image, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

type ActionType = "click" | "hover" | "type" | "scroll" | "wait" | "navigate" | "refresh" | "screenshot"

interface ActionLog {
  id: string
  action: ActionType
  params: string
  timestamp: number
  status: "running" | "completed" | "failed"
}

const ACTIONS: { value: ActionType; label: string }[] = [
  { value: "click", label: "Click" },
  { value: "hover", label: "Hover" },
  { value: "type", label: "Type Text" },
  { value: "scroll", label: "Scroll" },
  { value: "wait", label: "Wait" },
  { value: "navigate", label: "Navigate" },
  { value: "refresh", label: "Refresh" },
  { value: "screenshot", label: "Screenshot" },
]

export default function BrowserAutomationPage() {
  const [url, setUrl] = React.useState("")
  const [action, setAction] = React.useState<ActionType>("click")
  const [params, setParams] = React.useState("")
  const [running, setRunning] = React.useState(false)
  const [logs, setLogs] = React.useState<ActionLog[]>([])
  const [screenshots, setScreenshots] = React.useState<string[]>([])

  const executeAction = async () => {
    if (!url.trim()) return
    setRunning(true)
    const log: ActionLog = { id: generateId(), action, params, timestamp: Date.now(), status: "running" }
    setLogs((p) => [log, ...p])
    try {
      await new Promise((r) => setTimeout(r, 1000 + Math.random() * 1000))
      setLogs((p) => p.map((l) => l.id === log.id ? { ...l, status: "completed" } : l))
      if (action === "screenshot") {
        setScreenshots((p) => [...p, `Screenshot ${p.length + 1} - ${new Date().toLocaleTimeString()}`])
      }
    } catch {
      setLogs((p) => p.map((l) => l.id === log.id ? { ...l, status: "failed" } : l))
    } finally {
      setRunning(false)
    }
  }

  const clearLogs = () => { setLogs([]); setScreenshots([]) }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Browser Automation</h1>
        <p className="text-muted-foreground">Execute browser actions like click, type, scroll, and capture screenshots</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Button variant="outline" onClick={clearLogs}><Trash2 className="w-4 h-4" /> Clear</Button>
          </div>
          <div className="flex gap-3">
            <Select value={action} onValueChange={(v) => setAction(v as ActionType)}>
              <SelectTrigger className="w-36"><SelectValue /></SelectTrigger>
              <SelectContent>
                {ACTIONS.map((a) => (
                  <SelectItem key={a.value} value={a.value}>{a.label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder={action === "click" ? "CSS selector (e.g. #button)" : action === "type" ? "text to type" : action === "scroll" ? "pixels (e.g. 500)" : action === "wait" ? "ms (e.g. 2000)" : action === "navigate" ? "/path" : "params"} value={params} onChange={(e) => setParams(e.target.value)} className="flex-1" />
            <Button onClick={executeAction} disabled={running || !url.trim()}>
              {running ? <Bot className="w-4 h-4 animate-pulse" /> : <Play className="w-4 h-4" />}
              {running ? "Running..." : "Execute Action"}
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><List className="w-4 h-4" /> Action Log ({logs.length})</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {logs.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No actions executed yet</p>
              ) : (
                <div className="space-y-2">
                  {logs.map((log) => (
                    <div key={log.id} className="flex items-center gap-2 text-sm p-2 rounded-lg bg-muted/30">
                      {log.status === "running" ? <Bot className="w-4 h-4 text-amber-500 animate-pulse" /> : log.status === "completed" ? <MousePointer className="w-4 h-4 text-emerald-500" /> : <Bot className="w-4 h-4 text-destructive" />}
                      <Badge variant="outline" className="text-xs">{log.action}</Badge>
                      <span className="text-xs text-muted-foreground flex-1 truncate">{log.params || "(no params)"}</span>
                      <span className="text-xs text-muted-foreground">{new Date(log.timestamp).toLocaleTimeString()}</span>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Image className="w-4 h-4" /> Screenshots</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-64">
              {screenshots.length === 0 ? (
                <p className="text-sm text-muted-foreground text-center py-8">No screenshots captured</p>
              ) : (
                <div className="space-y-3">
                  {screenshots.map((s, i) => (
                    <div key={i} className="rounded-lg bg-muted/30 p-3">
                      <div className="w-full aspect-video bg-gradient-to-br from-muted to-muted/50 rounded-md mb-2 flex items-center justify-center">
                        <Image className="w-8 h-8 text-muted-foreground/40" />
                      </div>
                      <p className="text-xs text-muted-foreground">{s}</p>
                    </div>
                  ))}
                </div>
              )}
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    </DashboardShell>
  )
}
