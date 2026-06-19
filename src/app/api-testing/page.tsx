"use client"

import * as React from "react"
import { DashboardShell } from "@/components/layout/dashboard-shell"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Skeleton } from "@/components/ui/skeleton"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Send, Code2, CheckCircle, XCircle, Clock, List, Terminal } from "lucide-react"
import { cn } from "@/lib/utils"
import { runApiTest } from "@/lib/test-engine"
import { motion, AnimatePresence } from "framer-motion"
import { ErrorState } from "@/components/shared/error-state"
import type { ApiTestResult } from "@/types"

const METHODS = ["GET", "POST", "PUT", "PATCH", "DELETE", "GraphQL", "SOAP"]

export default function ApiTestingPage() {
  const [method, setMethod] = React.useState("GET")
  const [endpoint, setEndpoint] = React.useState("")
  const [headers, setHeaders] = React.useState<{ key: string; value: string }[]>([{ key: "Content-Type", value: "application/json" }])
  const [body, setBody] = React.useState("")
  const [loading, setLoading] = React.useState(false)
  const [result, setResult] = React.useState<ApiTestResult | null>(null)
  const [error, setError] = React.useState<string | null>(null)

  const addHeader = () => setHeaders([...headers, { key: "", value: "" }])
  const updateHeader = (i: number, field: "key" | "value", val: string) => {
    const h = [...headers]; h[i][field] = val; setHeaders(h)
  }
  const removeHeader = (i: number) => setHeaders(headers.filter((_, idx) => idx !== i))

  const sendRequest = async () => {
    if (!endpoint.trim()) return
    setLoading(true)
    setResult(null)
    setError(null)
    try {
      const headersObj = headers.reduce((acc, h) => { if (h.key) acc[h.key] = h.value; return acc }, {} as Record<string, string>)
      let payload: unknown = undefined
      if (body.trim()) {
        try { payload = JSON.parse(body) } catch { payload = body }
      }
      const res = await runApiTest(endpoint, method, { headers: headersObj, payload })
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
        <h1 className="text-3xl font-bold tracking-tight">API Testing</h1>
        <p className="text-muted-foreground">Test REST, GraphQL, and SOAP API endpoints with custom headers and body</p>
      </div>

      <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
        <CardContent className="p-4 space-y-4">
          <div className="flex gap-3">
            <Select value={method} onValueChange={setMethod}>
              <SelectTrigger className="w-32">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {METHODS.map((m) => (
                  <SelectItem key={m} value={m}>{m}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input placeholder="https://api.example.com/endpoint" value={endpoint} onChange={(e) => setEndpoint(e.target.value)} className="flex-1" />
            <Button onClick={sendRequest} disabled={loading || !endpoint.trim()}>
              {loading ? <Code2 className="w-4 h-4 animate-pulse" /> : <Send className="w-4 h-4" />}
              {loading ? "Sending..." : "Send Request"}
            </Button>
          </div>

          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-xs text-muted-foreground">Headers</Label>
              <Button variant="outline" size="sm" onClick={addHeader}>+ Add Header</Button>
            </div>
            <div className="space-y-2">
              {headers.map((h, i) => (
                <div key={i} className="flex gap-2">
                  <Input placeholder="Key" value={h.key} onChange={(e) => updateHeader(i, "key", e.target.value)} className="w-48" />
                  <Input placeholder="Value" value={h.value} onChange={(e) => updateHeader(i, "value", e.target.value)} className="flex-1" />
                  <Button variant="ghost" size="icon" onClick={() => removeHeader(i)} className="shrink-0"><XCircle className="w-4 h-4" /></Button>
                </div>
              ))}
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground mb-2 block">Request Body (JSON)</Label>
            <Textarea placeholder='{"key": "value"}' value={body} onChange={(e) => setBody(e.target.value)} className="min-h-[100px] font-mono text-xs" />
          </div>
        </CardContent>
      </Card>

      <AnimatePresence mode="wait">
        {loading && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="space-y-4">
            <Skeleton className="h-20 rounded-xl" />
            <Skeleton className="h-40 rounded-xl" />
          </motion.div>
        )}

        {error && !loading && (
          <ErrorState message={error} onRetry={sendRequest} />
        )}

        {result && !loading && (
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
            <div className="grid gap-4 md:grid-cols-4">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Status</p>
                  <p className={cn("text-2xl font-bold", result.success ? "text-emerald-500" : "text-destructive")}>{result.statusCode}</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Response Time</p>
                  <p className="text-2xl font-bold">{result.responseTime}ms</p>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Method</p>
                  <Badge variant="outline" className="text-sm">{result.method}</Badge>
                </CardContent>
              </Card>
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardContent className="p-4 text-center">
                  <p className="text-xs text-muted-foreground">Result</p>
                  {result.success ? <CheckCircle className="w-6 h-6 text-emerald-500 mx-auto" /> : <XCircle className="w-6 h-6 text-destructive mx-auto" />}
                </CardContent>
              </Card>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><List className="w-4 h-4" /> Response Headers</CardTitle></CardHeader>
                <CardContent>
                  {result.headers && Object.entries(result.headers).length > 0 ? (
                    <ScrollArea className="h-32">
                      <div className="space-y-1">
                        {Object.entries(result.headers).map(([k, v]) => (
                          <div key={k} className="flex gap-2 text-xs"><span className="text-muted-foreground shrink-0">{k}:</span><span className="font-mono">{String(v)}</span></div>
                        ))}
                      </div>
                    </ScrollArea>
                  ) : <p className="text-sm text-muted-foreground">No headers</p>}
                </CardContent>
              </Card>

              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Code2 className="w-4 h-4" /> Response Body</CardTitle></CardHeader>
                <CardContent>
                  <ScrollArea className="h-48">
                    <pre className="text-xs font-mono whitespace-pre-wrap">{JSON.stringify(result.response, null, 2)}</pre>
                  </ScrollArea>
                </CardContent>
              </Card>
            </div>

            {result.validationErrors && result.validationErrors.length > 0 && (
              <Card className="backdrop-blur-xl bg-background/60 border-muted/20">
                <CardHeader className="pb-2"><CardTitle className="text-sm flex items-center gap-2"><Terminal className="w-4 h-4 text-destructive" /> Validation Errors</CardTitle></CardHeader>
                <CardContent>
                  <ul className="space-y-1">
                    {result.validationErrors.map((err, i) => (
                      <li key={i} className="text-xs text-destructive">• {err}</li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}

        {!result && !loading && (
          <div className="flex flex-col items-center justify-center py-20 text-center">
            <Code2 className="w-16 h-16 text-muted-foreground/40 mb-4" />
            <p className="text-lg font-medium text-muted-foreground">Enter an API endpoint to test</p>
            <p className="text-sm text-muted-foreground/60">Send requests with custom methods, headers, and body payloads</p>
          </div>
        )}
      </AnimatePresence>
    </DashboardShell>
  )
}
