"use client"

import type React from "react"

import { useAuth } from "@/hooks/use-auth"
import { LoginModal } from "@/components/login-modal"
import { LoadingSpinner } from "@/components/loading-spinner"

interface AuthGuardProps {
  children: React.ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, loading } = useAuth()

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <LoadingSpinner />
      </div>
    )
  }

  if (!user) {
    return <LoginModal />
  }

  return <>{children}</>
}
