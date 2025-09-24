"use client"

import { Card } from "@/components/ui/card"
import { StatusIndicator } from "@/components/status-indicator"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { User, Bot } from "lucide-react"
import { useAuth } from "@/hooks/use-auth"

interface ChatEntry {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: number
  status?: "queued" | "processing" | "completed" | "error" | "timeout"
  processingTime?: number
}

interface ChatMessageProps {
  message: ChatEntry
}

export function ChatMessage({ message }: ChatMessageProps) {
  const { user } = useAuth()

  const formatProcessingTime = (ms: number) => {
    return (ms / 1000).toFixed(2)
  }

  if (message.type === "user") {
    return (
      <div className="flex justify-end">
        <div className="flex items-start space-x-3 max-w-[80%]">
          <Card className="bg-primary text-primary-foreground p-4">
            <p className="text-sm whitespace-pre-wrap">{message.content}</p>
          </Card>
          <Avatar className="h-8 w-8">
            <AvatarFallback className="bg-primary text-primary-foreground">
              <User className="h-4 w-4" />
            </AvatarFallback>
          </Avatar>
        </div>
      </div>
    )
  }

  return (
    <div className="flex justify-start">
      <div className="flex items-start space-x-3 max-w-[80%]">
        <Avatar className="h-8 w-8">
          <AvatarFallback className="bg-secondary text-secondary-foreground">
            <Bot className="h-4 w-4" />
          </AvatarFallback>
        </Avatar>
        <div className="space-y-2">
          <Card className="bg-card text-card-foreground p-4">
            {message.status === "completed" && message.content ? (
              <div className="space-y-2">
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                {message.processingTime && (
                  <p className="text-xs text-muted-foreground">
                    Response by MomentoAI, processed in {formatProcessingTime(message.processingTime)} seconds
                  </p>
                )}
              </div>
            ) : message.status === "error" || message.status === "timeout" ? (
              <p className="text-sm text-destructive">{message.content || "An error occurred"}</p>
            ) : (
              <div className="flex items-center space-x-2">
                <StatusIndicator status={message.status || "queued"} />
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  )
}
