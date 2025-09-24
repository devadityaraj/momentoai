"use client"

import { useState } from "react"
import { useAuth } from "@/hooks/use-auth"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Chrome } from "lucide-react"

export function LoginModal() {
  const { signInWithGoogle, error, loading } = useAuth()
  const [isSigningIn, setIsSigningIn] = useState(false)

  const handleSignIn = async () => {
    setIsSigningIn(true)
    await signInWithGoogle()
    setIsSigningIn(false)
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="w-full max-w-md bg-card border-border">
        <CardHeader className="text-center space-y-4">
          <div className="mx-auto w-16 h-16 bg-primary rounded-full flex items-center justify-center">
            <span className="text-2xl font-bold text-primary-foreground">M</span>
          </div>
          <CardTitle className="text-2xl font-bold text-card-foreground">Welcome to Momento AI</CardTitle>
          <CardDescription className="text-muted-foreground">
            Sign in with Google to start your AI-powered project journey
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {error && (
            <Alert variant="destructive">
              <AlertDescription>{error}</AlertDescription>
            </Alert>
          )}
          <Button
            onClick={handleSignIn}
            disabled={isSigningIn || loading}
            className="w-full bg-secondary hover:bg-secondary/90 text-secondary-foreground"
            size="lg"
          >
            <Chrome className="mr-2 h-5 w-5" />
            {isSigningIn ? "Signing in..." : "Continue with Google"}
          </Button>
          <p className="text-xs text-muted-foreground text-center">
            By signing in, you agree to our terms of service and privacy policy.
          </p>
        </CardContent>
      </Card>
    </div>
  )
}
