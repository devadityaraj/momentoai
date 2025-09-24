"use client"

import type React from "react"

import { useState, useEffect, useRef } from "react"
import { ref, push, onValue, off, set, remove } from "firebase/database"
import { database } from "@/lib/firebase"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ChatMessage } from "@/components/chat-message"
import { Send, AlertTriangle } from "lucide-react"
import type { Prompt, Result, PromptCondition, ServerStatus } from "@/types/firebase"

interface ChatInterfaceProps {
  initialPrompt: string
}

interface ChatEntry {
  id: string
  type: "user" | "ai"
  content: string
  timestamp: number
  status?: "queued" | "processing" | "completed" | "error" | "timeout"
  processingTime?: number
}

export function ChatInterface({ initialPrompt }: ChatInterfaceProps) {
  const { user, userData, canSendPrompt } = useAuth()
  const [messages, setMessages] = useState<ChatEntry[]>([])
  // Store prompt submission times by questionID
  const promptStartTimes = useRef<{ [key: string]: number }>({})
  const [currentPrompt, setCurrentPrompt] = useState("")
  const [serverStatus, setServerStatus] = useState<ServerStatus | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const chatContainerRef = useRef<HTMLDivElement>(null)
  const chatInterfaceRef = useRef<HTMLDivElement>(null)
    const initialPromptSent = useRef(false)

  // Generate question ID in HH:MM:SS:mmm format
  const generateQuestionID = () => {
    const now = new Date()
    const hours = now.getHours().toString().padStart(2, "0")
    const minutes = now.getMinutes().toString().padStart(2, "0")
    const seconds = now.getSeconds().toString().padStart(2, "0")
    const milliseconds = now.getMilliseconds().toString().padStart(3, "0")
    return `${hours}:${minutes}:${seconds}:${milliseconds}`
  }

  useEffect(() => {
    if (chatInterfaceRef.current) {
      chatInterfaceRef.current.style.transition = "opacity 0.8s ease-out, transform 0.8s ease-out"
      chatInterfaceRef.current.style.opacity = "1"
      chatInterfaceRef.current.style.transform = "translateY(0)"
    }
  }, [])

  // Handle initial prompt
    useEffect(() => {
    if (initialPrompt && messages.length === 0 && !initialPromptSent.current && user && userData) {
      handlePromptSubmit(initialPrompt)
      initialPromptSent.current = true
    }
  }, [initialPrompt, messages.length, user, userData])

  // Monitor server status
  useEffect(() => {
    const statusRef = ref(database, "serverstatus")
    const unsubscribe = onValue(statusRef, (snapshot) => {
      if (snapshot.exists()) {
        setServerStatus(snapshot.val() as ServerStatus)
      }
    })

    return () => unsubscribe()
  }, [])

  // Scroll to bottom when messages change
  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop = chatContainerRef.current.scrollHeight
    }
  }, [messages])

  const handlePromptSubmit = async (promptText: string) => {
    if (!user || !userData || !promptText.trim() || !canSendPrompt() || isSubmitting) return

    // Check server status
    if (serverStatus?.status === "Down") {
      alert("Server is currently down for maintenance. Please try again later.")
      return
    }

    setIsSubmitting(true)
    const questionID = generateQuestionID()

    // Record the time when prompt is submitted
    promptStartTimes.current[questionID] = Date.now()

    // Add user message to chat
    const userMessage: ChatEntry = {
      id: `user-${Date.now()}`,
      type: "user",
      content: promptText,
      timestamp: Date.now(),
    }

    // Add AI placeholder message
    const aiMessage: ChatEntry = {
      id: questionID,
      type: "ai",
      content: "",
      timestamp: Date.now(),
      status: "queued",
    }

    setMessages((prev) => [...prev, userMessage, aiMessage])
    setCurrentPrompt("")

    try {
      // Create prompt object
      const promptData: Prompt = {
        questionID,
        userID: user.uid,
        message: promptText,
        timestamp: Date.now(),
        status: "queued",
      }

  // Set to Firebase prompts queue with questionID as key
  const promptRef = ref(database, `prompts/${questionID}`)
  await set(promptRef, promptData)

      // Set initial prompt condition only if it does not exist (transaction)
      const conditionRef = ref(database, `promptcondition/${questionID}`)
      await import("firebase/database").then(({ runTransaction }) =>
        runTransaction(conditionRef, (currentData) => {
          if (currentData === null) {
            return {
              questionID,
              status: "queued",
              timestamp: Date.now(),
            }
          }
          return currentData
        })
      )

      // Update user prompt count
      const userRef = ref(database, `users/${user.uid}`)
      await set(userRef, {
        ...userData,
        promptCount: userData.promptCount + 1,
      })

      // Listen for status updates
      listenForResponse(questionID)
    } catch (error) {
      console.error("Error submitting prompt:", error)
      setMessages((prev) =>
        prev.map((msg) =>
          msg.id === questionID ? { ...msg, status: "error", content: "Failed to submit prompt" } : msg,
        ),
      )
    }

    setIsSubmitting(false)
  }

  const listenForResponse = (questionID: string) => {
    const conditionRef = ref(database, `promptcondition/${questionID}`)
    const resultRef = ref(database, `results/${questionID}`)

    // Listen for status changes
    const conditionUnsubscribe = onValue(conditionRef, (snapshot) => {
      if (snapshot.exists()) {
        const condition = snapshot.val() as PromptCondition & { error?: string }
        // Map backend status to ChatEntry status
        let mappedStatus: ChatEntry["status"] = undefined
        let errorMessage: string | undefined = undefined
        switch (condition.status) {
          case "queued":
          case "processing":
          case "timeout":
          case "error":
            mappedStatus = condition.status
            break
          case "completed":
            mappedStatus = "completed"
            break
          case "rate_limited":
            mappedStatus = "error"
            errorMessage = condition.error || "Rate limit exceeded. Please try again later."
            break
          default:
            mappedStatus = undefined
        }
        setMessages((prev) => prev.map((msg) =>
          msg.id === questionID
            ? {
                ...msg,
                status: mappedStatus,
                content: errorMessage && mappedStatus === "error" ? errorMessage : msg.content,
              }
            : msg
        ))

        // If processing is done, stop listening to condition
        if (
          condition.status === "completed" ||
          condition.status === "timeout" ||
          condition.status === "error" ||
          condition.status === "rate_limited"
        ) {
          off(conditionRef, "value", conditionUnsubscribe)
        }
      }
    })

    // Listen for results
    const resultUnsubscribe = onValue(resultRef, (snapshot) => {
      if (snapshot.exists()) {
        const result = snapshot.val() as Result
        // Calculate frontend processing time
        const startTime = promptStartTimes.current[questionID]
        const endTime = Date.now()
        const frontendProcessingTime = startTime ? endTime - startTime : undefined
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === questionID
              ? {
                  ...msg,
                  content: result.response,
                  status: "completed",
                  processingTime: frontendProcessingTime,
                }
              : msg,
          ),
        )
        off(resultRef, "value", resultUnsubscribe)

        setTimeout(async () => {
          try {
            console.log(`[v0] Auto-deleting result and condition for questionID: ${questionID}`)
            // Delete the result from Firebase
            await remove(ref(database, `results/${questionID}`))
            // Delete the prompt condition from Firebase
            await remove(ref(database, `promptcondition/${questionID}`))
            console.log(`[v0] Successfully deleted data for questionID: ${questionID}`)
          } catch (error) {
            console.error(`[v0] Error deleting data for questionID ${questionID}:`, error)
          }
        }, 2000) // Wait 2 seconds after display to ensure user sees the result
      }
    })

    // Set timeout for 5 minutes
    setTimeout(
      () => {
        off(conditionRef, "value", conditionUnsubscribe)
        off(resultRef, "value", resultUnsubscribe)
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === questionID && msg.status !== "completed"
              ? { ...msg, status: "timeout", content: "Request timed out. Please try again." }
              : msg,
          ),
        )

        setTimeout(async () => {
          try {
            console.log(`[v0] Auto-deleting timeout data for questionID: ${questionID}`)
            await remove(ref(database, `results/${questionID}`))
            await remove(ref(database, `promptcondition/${questionID}`))
            console.log(`[v0] Successfully deleted timeout data for questionID: ${questionID}`)
          } catch (error) {
            console.error(`[v0] Error deleting timeout data for questionID ${questionID}:`, error)
          }
        }, 2000)
      },
      5 * 60 * 1000,
    ) // 5 minutes
  }

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    handlePromptSubmit(currentPrompt)
  }

  return (
  <div ref={chatInterfaceRef} className="fixed inset-0 flex flex-col opacity-0 translate-y-12 z-50 bg-background">
    {/* Chat Messages */}
  <div ref={chatContainerRef} className="flex-1 overflow-y-auto px-4 py-6 space-y-4" style={{ minHeight: 0, maxHeight: 'calc(100vh - 200px)' }}>
      <div className="max-w-4xl mx-auto space-y-6">
        {messages.map((message) => (
          <ChatMessage key={message.id} message={message} />
        ))}
      </div>
    </div>

    {/* Input Area */}
    <div className="border-t border-border bg-background/95 backdrop-blur w-full z-10 flex-shrink-0">
      <div className="max-w-4xl mx-auto px-4 py-4">
        {serverStatus?.status === "Down" && (
          <Alert variant="destructive" className="mb-4">
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>Server is currently down for maintenance. {serverStatus.message}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleFormSubmit} className="relative">
          <Textarea
            value={currentPrompt}
            onChange={(e) => setCurrentPrompt(e.target.value)}
            placeholder="Ask MomentoAI"
            className="min-h-[60px] resize-none pr-12 bg-input border-border focus:border-ring"
            disabled={!canSendPrompt() || isSubmitting || serverStatus?.status === "Down"}
          />
          <Button
            type="submit"
            size="sm"
            className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90"
            disabled={!currentPrompt.trim() || !canSendPrompt() || isSubmitting || serverStatus?.status === "Down"}
          >
            <Send className="h-4 w-4" />
          </Button>
        </form>

        {!canSendPrompt() && (
          <p className="text-sm text-destructive mt-2">Rate limit reached. Please wait for reset.</p>
        )}
      </div>
    </div>
    {/* Footer */}
    <footer className="w-full bg-background border-t border-border text-center py-2 text-xs text-muted-foreground flex-shrink-0" style={{ position: 'relative', bottom: 0, left: 0, right: 0 }}>
      &copy; {new Date().getFullYear()} Momento AI. All rights reserved.
    </footer>
  )
    </div>
  )
}
