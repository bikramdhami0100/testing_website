"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Label } from "@/components/ui/label"
import { Switch } from "@/components/ui/switch"
import { Slider } from "@/components/ui/slider"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Separator } from "@/components/ui/separator"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogFooter, DialogTrigger, DialogClose } from "@/components/ui/dialog"
import { Settings, Save, Trash2, Bell, Sliders, Sun, Moon, Monitor, CheckCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { getSettings, saveSettings } from "@/lib/storage"
import { motion } from "framer-motion"
import type { UserSettings, TestType } from "@/types"
import { DEFAULT_SETTINGS } from "@/types"

const TEST_MODULES: { value: TestType; label: string }[] = [
  { value: "performance", label: "Performance" },
  { value: "seo", label: "SEO" },
  { value: "accessibility", label: "Accessibility" },
  { value: "security", label: "Security" },
  { value: "html-css-js", label: "HTML/CSS/JS" },
  { value: "api", label: "API Testing" },
  { value: "load", label: "Load Testing" },
  { value: "visual", label: "Visual Testing" },
  { value: "framework-detection", label: "Framework Detection" },
  { value: "full-audit", label: "Full Audit" },
]

const THEMES = [
  { value: "light", label: "Light", icon: Sun },
  { value: "dark", label: "Dark", icon: Moon },
  { value: "system", label: "System", icon: Monitor },
]

export default function SettingsPage() {
  const [settings, setSettings] = React.useState<UserSettings>(() => {
    const saved = getSettings()
    return saved ?? DEFAULT_SETTINGS
  })
  const [saved, setSaved] = React.useState(false)

  const update = <K extends keyof UserSettings>(key: K, value: UserSettings[K]) => {
    setSettings({ ...settings, [key]: value })
    setSaved(false)
  }

  const handleSave = () => {
    saveSettings(settings)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const clearAllData = () => {
    if (typeof window !== "undefined") {
      const keys = Object.keys(localStorage)
      keys.forEach((k) => { if (k.startsWith("web-check-")) localStorage.removeItem(k) })
    }
    setSettings(DEFAULT_SETTINGS)
    setSaved(true)
    setTimeout(() => setSaved(false), 2000)
  }

  const toggleModule = (module: TestType) => {
    const modules = settings.testingModules.includes(module)
      ? settings.testingModules.filter((m) => m !== module)
      : [...settings.testingModules, module]
    update("testingModules", modules)
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Settings</h1>
        <p className="text-muted-foreground">Configure your testing preferences and defaults</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Sun className="w-4 h-4" /> Appearance</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Theme</Label>
              <div className="flex gap-3">
                {THEMES.map((t) => {
                  const Icon = t.icon
                  return (
                    <button key={t.value} onClick={() => update("theme", t.value as "light" | "dark" | "system")} className={cn("flex-1 flex flex-col items-center gap-2 p-4 rounded-lg border transition-all", settings.theme === t.value ? "border-primary bg-primary/5" : "border-muted/20 bg-muted/20 hover:bg-muted/40")}>
                      <Icon className={cn("w-6 h-6", settings.theme === t.value ? "text-primary" : "text-muted-foreground")} />
                      <span className={cn("text-xs", settings.theme === t.value ? "font-medium" : "")}>{t.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm flex items-center gap-2"><Sliders className="w-4 h-4" /> Defaults</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Default URL</Label>
              <Input placeholder="https://example.com" value={settings.defaultUrl ?? ""} onChange={(e) => update("defaultUrl", e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Report Format</Label>
              <Select value={settings.reportFormat} onValueChange={(v) => update("reportFormat", v as UserSettings["reportFormat"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="html">HTML</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground mb-2 block">Concurrent Tests: {settings.concurrentTests}</Label>
              <Slider value={[settings.concurrentTests]} onValueChange={([v]) => update("concurrentTests", v)} min={1} max={10} step={1} />
            </div>
          </CardContent>
        </Card>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><Bell className="w-4 h-4" /> Preferences</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Notifications</p><p className="text-xs text-muted-foreground">Show notifications when tests complete</p></div>
              <Switch checked={settings.notifications} onCheckedChange={(v) => update("notifications", v)} />
            </div>
            <Separator />
            <div className="flex items-center justify-between">
              <div><p className="text-sm font-medium">Auto-Save Results</p><p className="text-xs text-muted-foreground">Automatically save test results to history</p></div>
              <Switch checked={settings.autoSave} onCheckedChange={(v) => update("autoSave", v)} />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardHeader className="pb-2">
          <CardTitle className="text-sm flex items-center gap-2"><CheckCircle className="w-4 h-4" /> Testing Modules</CardTitle>
          <CardDescription>Select which modules appear in your test dashboard</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {TEST_MODULES.map((m) => (
              <div key={m.value} className="flex items-center gap-2">
                <Checkbox id={`module-${m.value}`} checked={settings.testingModules.includes(m.value)} onCheckedChange={() => toggleModule(m.value)} />
                <Label htmlFor={`module-${m.value}`} className="text-sm">{m.label}</Label>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button onClick={handleSave} className="gap-2">
          {saved ? <CheckCircle className="w-4 h-4" /> : <Save className="w-4 h-4" />}
          {saved ? "Saved!" : "Save Settings"}
        </Button>

        <Dialog>
          <DialogTrigger asChild>
            <Button variant="destructive" className="gap-2"><Trash2 className="w-4 h-4" /> Clear All Data</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Clear All Data</DialogTitle>
              <DialogDescription>This will permanently delete all saved reports, settings, and test history. This action cannot be undone.</DialogDescription>
            </DialogHeader>
            <DialogFooter>
              <DialogClose asChild><Button variant="outline">Cancel</Button></DialogClose>
              <DialogClose asChild>
                <Button variant="destructive" onClick={clearAllData}>Yes, Clear Everything</Button>
              </DialogClose>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </DashboardShell>
  )
}
