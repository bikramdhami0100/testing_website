"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { ClipboardCheck, Plus, Save, Download, Trash2, CheckCircle, XCircle, MinusCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { generateId } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"

const TEST_TYPES = [
  { value: "uat", label: "User Acceptance (UAT)" },
  { value: "cat", label: "Contract Acceptance (CAT)" },
  { value: "bat", label: "Business Acceptance (BAT)" },
  { value: "oat", label: "Operational Acceptance (OAT)" },
  { value: "alpha", label: "Alpha Testing" },
  { value: "beta", label: "Beta Testing" },
]

interface TestItem {
  id: string
  description: string
  expectedResult: string
  result: "pass" | "fail" | "pending" | "na"
  notes: string
}

export default function AcceptanceTestingPage() {
  const [testType, setTestType] = React.useState("uat")
  const [testName, setTestName] = React.useState("")
  const [items, setItems] = React.useState<TestItem[]>([])
  const [savedTests, setSavedTests] = React.useState<{ name: string; type: string; items: TestItem[]; date: number }[]>(() => {
    if (typeof window !== "undefined") {
      try { return JSON.parse(localStorage.getItem("acceptance-tests") ?? "[]") } catch { return [] }
    }
    return []
  })

  React.useEffect(() => {
    localStorage.setItem("acceptance-tests", JSON.stringify(savedTests))
  }, [savedTests])

  const addItem = () => {
    setItems([...items, { id: generateId(), description: "", expectedResult: "", result: "pending", notes: "" }])
  }

  const updateItem = (id: string, field: keyof TestItem, value: string) => {
    setItems(items.map((i) => i.id === id ? { ...i, [field]: value } : i))
  }

  const removeItem = (id: string) => setItems(items.filter((i) => i.id !== id))

  const saveTest = () => {
    if (!testName.trim()) return
    const test = { name: testName, type: testType, items: [...items], date: Date.now() }
    setSavedTests([...savedTests, test])
    setTestName("")
    setItems([])
  }

  const loadTest = (test: typeof savedTests[number]) => {
    setTestName(test.name)
    setTestType(test.type)
    setItems(test.items)
  }

  const deleteTest = (i: number) => setSavedTests(savedTests.filter((_, idx) => idx !== i))

  const exportResults = () => {
    const data = JSON.stringify({ type: testType, name: testName, items, date: Date.now() }, null, 2)
    const blob = new Blob([data], { type: "application/json" })
    const url = URL.createObjectURL(blob)
    const a = document.createElement("a")
    a.href = url; a.download = `${testName || "acceptance-test"}.json`; a.click()
    URL.revokeObjectURL(url)
  }

  const resultIcon = (r: string) => {
    if (r === "pass") return <CheckCircle className="w-4 h-4 text-emerald-500" />
    if (r === "fail") return <XCircle className="w-4 h-4 text-destructive" />
    if (r === "na") return <MinusCircle className="w-4 h-4 text-muted-foreground" />
    return <MinusCircle className="w-4 h-4 text-amber-500" />
  }

  const counts = { pass: items.filter((i) => i.result === "pass").length, fail: items.filter((i) => i.result === "fail").length, pending: items.filter((i) => i.result === "pending").length }

  return (
    <DashboardShell>
      <div className="flex flex-col gap-2">
        <h1 className="text-3xl font-bold tracking-tight">Acceptance Testing</h1>
        <p className="text-muted-foreground">Create and manage acceptance test cases with pass/fail tracking</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Test Configuration</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            <div>
              <Label className="text-xs text-muted-foreground">Test Type</Label>
              <Select value={testType} onValueChange={setTestType}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {TEST_TYPES.map((t) => (<SelectItem key={t.value} value={t.value}>{t.label}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Test Name</Label>
              <Input placeholder="e.g. Login Flow" value={testName} onChange={(e) => setTestName(e.target.value)} />
            </div>
            <div className="flex gap-2">
              <Button onClick={addItem} variant="outline" className="flex-1"><Plus className="w-4 h-4" /> Add Item</Button>
              <Button onClick={saveTest} disabled={!testName.trim() || items.length === 0} className="flex-1"><Save className="w-4 h-4" /> Save Test</Button>
              <Button onClick={exportResults} variant="secondary" disabled={items.length === 0}><Download className="w-4 h-4" /> Export</Button>
            </div>
          </CardContent>
        </Card>

        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><ClipboardCheck className="w-4 h-4" /> Summary</CardTitle></CardHeader>
          <CardContent>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div><p className="text-2xl font-bold text-emerald-500">{counts.pass}</p><p className="text-xs text-muted-foreground">Passed</p></div>
              <div><p className="text-2xl font-bold text-destructive">{counts.fail}</p><p className="text-xs text-muted-foreground">Failed</p></div>
              <div><p className="text-2xl font-bold text-amber-500">{counts.pending}</p><p className="text-xs text-muted-foreground">Pending</p></div>
            </div>
            <Separator className="my-3" />
            <p className="text-sm text-muted-foreground">Total: {items.length} items</p>
          </CardContent>
        </Card>
      </div>

      {items.length > 0 && (
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Test Items ({items.length})</CardTitle></CardHeader>
          <CardContent className="space-y-4">
            {items.map((item, i) => (
              <div key={item.id} className="p-4 rounded-lg bg-muted/30 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs text-muted-foreground">Item #{i + 1}</span>
                  <Button variant="ghost" size="icon" onClick={() => removeItem(item.id)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                </div>
                <div className="grid gap-3 md:grid-cols-2">
                  <div>
                    <Label className="text-xs text-muted-foreground">Description</Label>
                    <Input value={item.description} onChange={(e) => updateItem(item.id, "description", e.target.value)} placeholder="Describe the test step" />
                  </div>
                  <div>
                    <Label className="text-xs text-muted-foreground">Expected Result</Label>
                    <Input value={item.expectedResult} onChange={(e) => updateItem(item.id, "expectedResult", e.target.value)} placeholder="What should happen" />
                  </div>
                </div>
                <div className="flex gap-3">
                  <div className="flex-1">
                    <Label className="text-xs text-muted-foreground">Result</Label>
                    <Select value={item.result} onValueChange={(v) => updateItem(item.id, "result", v)}>
                      <SelectTrigger className={cn(item.result === "pass" ? "text-emerald-500" : item.result === "fail" ? "text-destructive" : "")}>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pending</SelectItem>
                        <SelectItem value="pass">Pass</SelectItem>
                        <SelectItem value="fail">Fail</SelectItem>
                        <SelectItem value="na">N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex-[2]">
                    <Label className="text-xs text-muted-foreground">Notes</Label>
                    <Input value={item.notes} onChange={(e) => updateItem(item.id, "notes", e.target.value)} placeholder="Optional notes" />
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {savedTests.length > 0 && (
        <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
          <CardHeader className="pb-2"><CardTitle className="text-sm">Saved Tests ({savedTests.length})</CardTitle></CardHeader>
          <CardContent>
            <div className="space-y-2">
              {savedTests.map((test, i) => (
                <div key={i} className="flex items-center justify-between p-3 rounded-lg bg-muted/30">
                  <div>
                    <p className="font-medium">{test.name}</p>
                    <p className="text-xs text-muted-foreground">{TEST_TYPES.find((t) => t.value === test.type)?.label} - {test.items.length} items - {new Date(test.date).toLocaleDateString()}</p>
                  </div>
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => loadTest(test)}><ClipboardCheck className="w-3 h-3" /> Load</Button>
                    <Button variant="ghost" size="icon" onClick={() => deleteTest(i)}><Trash2 className="w-4 h-4 text-destructive" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {items.length === 0 && savedTests.length === 0 && (
        <div className="flex flex-col items-center justify-center py-20 text-center">
          <ClipboardCheck className="w-16 h-16 text-muted-foreground/40 mb-4" />
          <p className="text-lg font-medium text-muted-foreground">Create your first acceptance test</p>
          <p className="text-sm text-muted-foreground/60">Add test items with descriptions and expected results</p>
        </div>
      )}
    </DashboardShell>
  )
}
