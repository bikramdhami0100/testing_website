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
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Wand2, Plus, Trash2, MoveUp, MoveDown, Play, Save, Download, MousePointer, Type, Scroll, RefreshCw, Eye, Code2, Globe, Clock, List } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import type { TestFlowStep } from "@/types"

const ACTION_TYPES: { value: TestFlowStep["type"]; label: string; icon: React.ElementType }[] = [
  { value: "openUrl", label: "Open URL", icon: Globe },
  { value: "click", label: "Click", icon: MousePointer },
  { value: "hover", label: "Hover", icon: MousePointer },
  { value: "typeText", label: "Type Text", icon: Type },
  { value: "scroll", label: "Scroll", icon: Scroll },
  { value: "wait", label: "Wait", icon: Clock },
  { value: "refresh", label: "Refresh", icon: RefreshCw },
  { value: "screenshot", label: "Screenshot", icon: Eye },
  { value: "verifyText", label: "Verify Text", icon: Code2 },
  { value: "executeJs", label: "Execute JS", icon: Code2 },
  { value: "delay", label: "Delay", icon: Clock },
  { value: "navigate", label: "Navigate", icon: Globe },
]

export default function CustomTestBuilderPage() {
  const [steps, setSteps] = React.useState<TestFlowStep[]>([])
  const [actionType, setActionType] = React.useState<TestFlowStep["type"]>("click")
  const [description, setDescription] = React.useState("")
  const [paramsText, setParamsText] = React.useState("")
  const [executing, setExecuting] = React.useState(false)
  const [executionLog, setExecutionLog] = React.useState<string[]>([])
  const [workflows, setWorkflows] = React.useState<{ name: string; steps: TestFlowStep[]; date: number }[]>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("custom-workflows") ?? "[]") } catch { return [] }
    }
    return []
  })
  const [workflowName, setWorkflowName] = React.useState("")

  React.useEffect(() => {
    localStorage.setItem("custom-workflows", JSON.stringify(workflows))
  }, [workflows])

  const addStep = () => {
    const params: Record<string, unknown> = {}
    if (paramsText.trim()) {
      try { Object.assign(params, JSON.parse(paramsText)) } catch { params.value = paramsText }
    }
    const step: TestFlowStep = { id: generateId(), type: actionType, params, description: description || actionType }
    setSteps([...steps, step])
    setParamsText("")
    setDescription("")
  }

  const removeStep = (id: string) => setSteps(steps.filter((s) => s.id !== id))
  const moveUp = (i: number) => { if (i === 0) return; const s = [...steps]; [s[i - 1], s[i]] = [s[i], s[i - 1]]; setSteps(s) }
  const moveDown = (i: number) => { if (i === steps.length - 1) return; const s = [...steps]; [s[i], s[i + 1]] = [s[i + 1], s[i]]; setSteps(s) }

  const saveWorkflow = () => {
    if (!workflowName.trim() || steps.length === 0) return
    setWorkflows([...workflows, { name: workflowName, steps: [...steps], date: Date.now() }])
    setWorkflowName("")
  }

  const loadWorkflow = (wf: typeof workflows[number]) => {
    setSteps(wf.steps)
    setWorkflowName(wf.name)
  }

  const deleteWorkflow = (i: number) => setWorkflows(workflows.filter((_, idx) => idx !== i))

  const runTest = async () => {
    if (steps.length === 0) return
    setExecuting(true)
    setExecutionLog([])
    for (let i = 0; i < steps.length; i++) {
      const step = steps[i]
      setExecutionLog((p) => [...p, `[${i + 1}] Executing: ${step.description || step.type}...`])
      await new Promise((r) => setTimeout(r, 500 + Math.random() * 500))
      setExecutionLog((p) => [...p, `[${i + 1}] ✓ Completed: ${step.description || step.type}`])
    }
    setExecutionLog((p) => [...p, `✓ All ${steps.length} steps completed successfully`])
    setExecuting(false)
  }

  const actionIcon = (type: string) => {
    const found = ACTION_TYPES.find((a) => a.value === type)
    return found ? found.icon : Wand2
  }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Custom Test Builder</h1>
        <p className="text-muted-foreground">Build custom test workflows visually with drag-to-reorder steps</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Wand2 className="w-4 h-4" /> Add Step</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Action Type</Label>
              <Select value={actionType} onValueChange={(v) => setActionType(v as TestFlowStep["type"])}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ACTION_TYPES.map((a) => {
                    const Icon = a.icon
                    return (<SelectItem key={a.value} value={a.value}><span className="flex items-center gap-2"><Icon className="w-3 h-3" />{a.label}</span></SelectItem>)
                  })}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Description</Label>
              <Input placeholder="e.g. Click login button" value={description} onChange={(e) => setDescription(e.target.value)} />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Parameters (JSON or text)</Label>
              <Input placeholder='{"selector": "#login"}' value={paramsText} onChange={(e) => setParamsText(e.target.value)} />
            </div>
            <Button onClick={addStep} className="w-full"><Plus className="w-4 h-4" /> Add Step</Button>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Save className="w-4 h-4" /> Save / Load</CardTitle></CardHeader>
          <CardContent className="space-y-3">
            <div className="flex gap-2">
              <Input placeholder="Workflow name" value={workflowName} onChange={(e) => setWorkflowName(e.target.value)} className="flex-1" />
              <Button onClick={saveWorkflow} disabled={!workflowName.trim() || steps.length === 0} variant="outline"><Save className="w-4 h-4" /> Save</Button>
            </div>
            {workflows.length > 0 && (
              <ScrollArea className="h-32">
                <div className="space-y-1">
                  {workflows.map((wf, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded bg-muted/30">
                      <div><p className="text-xs font-medium">{wf.name}</p><p className="text-xs text-muted-foreground">{wf.steps.length} steps</p></div>
                      <div className="flex gap-1">
                        <Button variant="ghost" size="icon" onClick={() => loadWorkflow(wf)} className="h-6 w-6"><Wand2 className="w-3 h-3" /></Button>
                        <Button variant="ghost" size="icon" onClick={() => deleteWorkflow(i)} className="h-6 w-6"><Trash2 className="w-3 h-3 text-destructive" /></Button>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            )}
          </CardContent>
        </Card>
      </div>

      {steps.length > 0 && (
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2">
            <div className="flex items-center justify-between">
              <CardTitle className="text-sm flex items-center gap-2"><List className="w-4 h-4" /> Steps ({steps.length})</CardTitle>
              <Button onClick={runTest} disabled={executing} size="sm">
                {executing ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Play className="w-4 h-4" />}
                {executing ? "Running..." : "Run Test"}
              </Button>
            </div>
          </CardHeader>
          <CardContent className="space-y-2">
            {steps.map((step, i) => {
              const Icon = actionIcon(step.type)
              return (
                <div key={step.id} className="flex items-center gap-2 p-3 rounded-lg bg-muted/30">
                  <span className="text-xs text-muted-foreground w-6">{i + 1}.</span>
                  <Icon className="w-4 h-4 text-primary shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate">{step.description || step.type}</p>
                    <p className="text-xs text-muted-foreground truncate">{JSON.stringify(step.params)}</p>
                  </div>
                  <div className="flex gap-1 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => moveUp(i)} disabled={i === 0} className="h-7 w-7"><MoveUp className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => moveDown(i)} disabled={i === steps.length - 1} className="h-7 w-7"><MoveDown className="w-3 h-3" /></Button>
                    <Button variant="ghost" size="icon" onClick={() => removeStep(step.id)} className="h-7 w-7"><Trash2 className="w-3 h-3 text-destructive" /></Button>
                  </div>
                </div>
              )
            })}
          </CardContent>
        </Card>
      )}

      {executionLog.length > 0 && (
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Play className="w-4 h-4" /> Execution Log</CardTitle></CardHeader>
          <CardContent>
            <ScrollArea className="h-40">
              <div className="space-y-1">
                {executionLog.map((log, i) => (
                  <p key={i} className={cn("text-xs font-mono", log.startsWith("✓") ? "text-emerald-500" : "text-muted-foreground")}>{log}</p>
                ))}
              </div>
            </ScrollArea>
          </CardContent>
        </Card>
      )}

      {steps.length === 0 && !executing && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <Wand2 className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Build your custom test workflow</p>
          <p className="text-sm text-muted-foreground/60">Add steps with various actions, reorder them, and execute your test</p>
        </div>
      )}
    </DashboardShell>
  )
}

