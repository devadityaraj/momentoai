"use client"

import { useState, useEffect } from "react"
import { ref, onValue } from "firebase/database"
import { database } from "@/lib/firebase"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertTriangle } from "lucide-react"
import type { ServerStatus } from "@/types/firebase"

export function ServerStatusBanner() {
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [showBanner, setShowBanner] = useState(false)

  useEffect(() => {
    const statusRef = ref(database, "serverstatus")
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        const status = snapshot.val() as ServerStatus
        setServerStatus(status)
        setShowBanner(status.status === "offline" || server.status === "error")
      }
    })

    return () => unsubscribe()
  }, [])

  if (!showBanner || !serverStatus) return null

  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertDescription className="flex items-center justify-between">
        <span>Server is currently down for maintenance. {serverStatus.message && `- ${serverStatus.message}`}</span>
        <Button variant="outline" size="sm" onClick={() => setShowBanner(false)} className="ml-4">
          OK
        </Button>
      </AlertDescription>
    </Alert>
  )
}
