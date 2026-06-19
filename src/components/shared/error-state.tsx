"use client"

import { motion } from "framer-motion"
import { AlertTriangle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"

export function ErrorState({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
      <Card className="border-red-500/30 bg-red-500/5 backdrop-blur-xl">
        <CardContent className="p-6 flex flex-col items-center text-center gap-4">
          <AlertTriangle className="w-12 h-12 text-red-500" />
          <div>
            <p className="text-lg font-semibold text-red-500">Test Failed</p>
            <p className="text-sm text-muted-foreground mt-1">{message}</p>
          </div>
          <Button variant="outline" onClick={onRetry} className="gap-2">
            <RefreshCw className="w-4 h-4" />
            Retry
          </Button>
        </CardContent>
      </Card>
    </motion.div>
  )
}
