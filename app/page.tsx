"use client"

import { useState } from "react"
import { AuthGuard } from "@/components/auth-guard"
import { Header } from "@/components/header"
import { LandingHero } from "@/components/landing-hero"
import { ChatInterface } from "@/components/chat-interface"
import { ServerStatusBanner } from "@/components/server-status-banner"
import Footer  from "@/components/footer"

export default function HomePage() {
  const [chatMode, setChatMode] = useState(false)
  const [initialPrompt, setInitialPrompt] = useState("")

  const handlePromptSubmit = (prompt: string) => {
    setInitialPrompt(prompt)
    setChatMode(true)
  }

  return (
    <AuthGuard>
      <div className="min-h-screen bg-background flex flex-col">
        <Header />
        <main className="flex-1 flex flex-col">
          <div className="container mx-auto px-4 py-4">
            <ServerStatusBanner />
          </div>
          {!chatMode ? (
            <LandingHero onPromptSubmit={handlePromptSubmit} />
          ) : (
            <ChatInterface initialPrompt={initialPrompt} />
          )}
        </main>
        <Footer />
      </div>
    </AuthGuard>
  )
}
