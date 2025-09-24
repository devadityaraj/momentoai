"use client"

import type React from "react"

import { useState, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { LimitationsModal } from "@/components/limitations-modal"
import { useAuth } from "@/hooks/use-auth"
import { Send } from "lucide-react"

interface LandingHeroProps {
  onPromptSubmit: (prompt: string) => void
}

export function LandingHero({ onPromptSubmit }: LandingHeroProps) {
  const [prompt, setPrompt] = useState("")
  const [showLimitations, setShowLimitations] = useState(false)
  const { canSendPrompt, getRemainingPrompts } = useAuth()
  const heroRef = useRef<HTMLDivElement>(null)
  const titleRef = useRef<HTMLHeadingElement>(null)
  const promptBoxRef = useRef<HTMLDivElement>(null)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!prompt.trim() || !canSendPrompt()) return

    animateToChat()
    onPromptSubmit(prompt.trim())
  }

  const animateToChat = () => {
    if (titleRef.current) {
      titleRef.current.style.transition = "opacity 0.6s ease-out, transform 0.6s ease-out"
      titleRef.current.style.opacity = "0"
      titleRef.current.style.transform = "translateY(-50px)"
    }

    setTimeout(() => {
      if (promptBoxRef.current) {
        promptBoxRef.current.style.transition = "transform 0.8s ease-out"
        promptBoxRef.current.style.transform = "translateY(200px) scale(0.95)"
      }
    }, 200)

    setTimeout(() => {
      if (heroRef.current) {
        heroRef.current.style.transition = "opacity 0.4s ease-out"
        heroRef.current.style.opacity = "0"
        setTimeout(() => {
          if (heroRef.current) {
            heroRef.current.style.display = "none"
          }
        }, 400)
      }
    }, 600)
  }

  return (
    <>
      <div ref={heroRef} className="flex-1 flex items-center justify-center px-4 py-8">
        <div className="w-full max-w-2xl text-center space-y-8">
          {/* Hero Title */}
          <div ref={titleRef} className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold text-foreground text-balance">
              Try the{" "}
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                Momento AI
              </span>
            </h1>
            <p className="text-xl text-muted-foreground text-pretty">Beta Version 1.0</p>
          </div>

          {/* Prompt Input */}
          <div ref={promptBoxRef} className="space-y-4">
            <form onSubmit={handleSubmit} className="relative">
              <Textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Ask MomentoAI"
                className="min-h-[120px] text-lg resize-none bg-input border-border focus:border-ring pr-12"
                disabled={!canSendPrompt()}
              />
              <Button
                type="submit"
                size="sm"
                className="absolute bottom-3 right-3 bg-primary hover:bg-primary/90"
                disabled={!prompt.trim() || !canSendPrompt()}
              >
                <Send className="h-4 w-4" />
              </Button>
            </form>

            {/* Limitations Link and Status */}
            <div className="flex items-center justify-between text-sm">
              <button
                type="button"
                onClick={() => setShowLimitations(true)}
                className="text-secondary hover:text-secondary/80 underline underline-offset-4"
              >
                Limitations
              </button>
              <div className="text-muted-foreground">
                {canSendPrompt() ? (
                  <span>{getRemainingPrompts()} prompts remaining</span>
                ) : (
                  <span className="text-destructive">Rate limit reached</span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      <LimitationsModal open={showLimitations} onOpenChange={setShowLimitations} />
    </>
  )
}
