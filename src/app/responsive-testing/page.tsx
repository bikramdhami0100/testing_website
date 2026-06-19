"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Monitor, Tablet, Smartphone, RotateCw, AlertTriangle, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

interface Device {
  name: string
  width: number
  height: number
  icon: React.ElementType
}

const DEVICES: Device[] = [
  { name: "Desktop HD", width: 1920, height: 1080, icon: Monitor },
  { name: "Desktop", width: 1440, height: 900, icon: Monitor },
  { name: "Laptop", width: 1366, height: 768, icon: Monitor },
  { name: "Tablet Landscape", width: 1024, height: 768, icon: Tablet },
  { name: "Tablet", width: 768, height: 1024, icon: Tablet },
  { name: "Mobile L", width: 425, height: 812, icon: Smartphone },
  { name: "Mobile M", width: 375, height: 667, icon: Smartphone },
  { name: "Mobile S", width: 320, height: 568, icon: Smartphone },
]

export default function ResponsiveTestingPage() {
  const [url, setUrl] = React.useState("")
  const [selectedDevice, setSelectedDevice] = React.useState(DEVICES[1])
  const [orientation, setOrientation] = React.useState<"portrait" | "landscape">("portrait")
  const [loading, setLoading] = React.useState(false)

  const device = { ...selectedDevice }
  if (orientation === "landscape") {
    device.width = selectedDevice.height
    device.height = selectedDevice.width
  }

  const issues: { device: string; issue: string; severity: "critical" | "warning" | "info" }[] = [
    { device: "Mobile S", issue: "Navigation menu overlaps content at 320px", severity: "critical" },
    { device: "Mobile M", issue: "Hero image exceeds viewport width", severity: "warning" },
    { device: "Tablet", issue: "Sidebar collapses but content gap appears", severity: "warning" },
    { device: "Desktop", issue: "Max-width container creates excessive whitespace", severity: "info" },
  ]

  const analyzeResponsive = async () => {
    if (!url.trim()) return
    setLoading(true)
    await new Promise((r) => setTimeout(r, 1500))
    setLoading(false)
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Responsive Testing</h1>
        <p className="text-muted-foreground">Preview and test your website across multiple device sizes</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <Input placeholder="https://example.com" value={url} onChange={(e) => setUrl(e.target.value)} className="flex-1" />
            <Button onClick={analyzeResponsive} disabled={loading || !url.trim()}>
              {loading ? <Monitor className="w-4 h-4 animate-pulse" /> : <Monitor className="w-4 h-4" />}
              {loading ? "Analyzing..." : "Analyze"}
            </Button>
          </div>
          <div className="flex gap-3">
            <div className="flex-1">
              <Label className="text-xs text-muted-foreground">Device</Label>
              <Select value={selectedDevice.name} onValueChange={(v) => setSelectedDevice(DEVICES.find((d) => d.name === v) ?? DEVICES[1])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {DEVICES.map((d) => {
                    const Icon = d.icon
                    return (<SelectItem key={d.name} value={d.name}><span className="flex items-center gap-2"><Icon className="w-3 h-3" />{d.name} ({d.width}x{d.height})</span></SelectItem>)
                  })}
                </SelectContent>
              </Select>
            </div>
            <div className="w-32">
              <Label className="text-xs text-muted-foreground">Orientation</Label>
              <Button variant="outline" className="w-full" onClick={() => setOrientation(orientation === "portrait" ? "landscape" : "portrait")}>
                <RotateCw className="w-4 h-4 mr-2" /> {orientation}
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="md:col-span-2">
          <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
            <CardContent className="p-4">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <device.icon className="w-4 h-4" />
                  <span className="text-sm font-medium">{device.name}</span>
                  <Badge variant="outline" className="text-xs">{device.width}x{device.height}</Badge>
                </div>
                {url && <Badge variant="secondary" className="text-xs">{orientation}</Badge>}
              </div>
              <div className="mx-auto border border-muted/30 rounded-lg overflow-hidden bg-white" style={{ maxWidth: "100%", width: Math.min(device.width, 700), height: Math.min(device.height * 0.6, 400) }}>
                <div className="w-full h-full bg-gradient-to-br from-slate-100 to-slate-200 dark:from-slate-800 dark:to-slate-900 flex items-center justify-center">
                  {url ? (
                    <div className="text-center p-4">
                      <Monitor className="w-12 h-12 text-muted-foreground/40 mx-auto mb-2" />
                      <p className="text-sm text-muted-foreground">Preview: {url}</p>
                      <p className="text-xs text-muted-foreground/60">{device.width}x{device.height} viewport</p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">Enter a URL to preview</p>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
            <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><AlertTriangle className="w-4 h-4" /> Issues</CardTitle></CardHeader>
            <CardContent className="space-y-3">
              {issues.map((issue, i) => (
                <div key={i} className="p-2 rounded-lg bg-muted/30">
                  <div className="flex items-center gap-2 mb-1">
                    {issue.severity === "critical" ? <AlertTriangle className="w-3 h-3 text-destructive" /> : issue.severity === "warning" ? <AlertTriangle className="w-3 h-3 text-amber-500" /> : <AlertTriangle className="w-3 h-3 text-blue-500" />}
                    <Badge variant="outline" className="text-xs">{issue.device}</Badge>
                  </div>
                  <p className="text-xs text-muted-foreground">{issue.issue}</p>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardHeader className="pb-2"><CardTitle className="text-sm">All Device Sizes</CardTitle></CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {DEVICES.map((d) => {
              const Icon = d.icon
              const isSelected = d.name === selectedDevice.name
              return (
                <button key={d.name} onClick={() => setSelectedDevice(d)} className={cn("p-3 rounded-lg text-left transition-all border", isSelected ? "border-primary bg-primary/5" : "border-muted/20 bg-muted/20 hover:bg-muted/40")}>
                  <Icon className={cn("w-5 h-5 mb-1", isSelected ? "text-primary" : "text-muted-foreground")} />
                  <p className="text-sm font-medium">{d.name}</p>
                  <p className="text-xs text-muted-foreground">{d.width}x{d.height}</p>
                </button>
              )
            })}
          </div>
        </CardContent>
      </Card>
    </DashboardShell>
  )
}
