"use client"

import { useState, useEffect } from "react"
import { LoadingSpinner } from "@/components/loading-spinner"

interface StatusIndicatorProps {
  status: "queued" | "processing" | "completed" | "error" | "timeout"
}

export function StatusIndicator({ status }: StatusIndicatorProps) {
  const [timer, setTimer] = useState(0)

  useEffect(() => {
    let interval: NodeJS.Timeout | null = null

    if (status === "processing") {
      interval = setInterval(() => {
        setTimer((prev) => prev + 0.01)
      }, 10)
    } else {
      setTimer(0)
    }

    return () => {
      if (interval) clearInterval(interval)
    }
  }, [status])

  const formatTimer = (seconds: number) => {
    const mins = Math.floor(seconds / 60)
    const secs = (seconds % 60).toFixed(2)
    return `${mins}:${secs.padStart(5, "0")}`
  }

  switch (status) {
    case "queued":
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <div className="w-2 h-2 bg-secondary rounded-full animate-pulse"></div>
          <span className="text-sm">Queued</span>
        </div>
      )

    case "processing":
      return (
        <div className="flex items-center space-x-2 text-muted-foreground">
          <LoadingSpinner />
          <span className="text-sm">Processing... {formatTimer(timer)}</span>
        </div>
      )

    case "error":
      return (
        <div className="flex items-center space-x-2 text-destructive">
          <div className="w-2 h-2 bg-destructive rounded-full"></div>
          <span className="text-sm">Error occurred</span>
        </div>
      )

    case "timeout":
      return (
        <div className="flex items-center space-x-2 text-destructive">
          <div className="w-2 h-2 bg-destructive rounded-full"></div>
          <span className="text-sm">Request timed out</span>
        </div>
      )

    default:
      return null
  }
}
