"use client"

import { useState, useEffect } from "react"
import { type User as FirebaseUser, onAuthStateChanged, signInWithPopup, signOut } from "firebase/auth"
import { ref, set, get } from "firebase/database"
import { auth, googleProvider, database } from "@/lib/firebase"
import type { User } from "@/types/firebase"

export function useAuth() {
  const [user, setUser] = useState<FirebaseUser | null>(null)
  const [userData, setUserData] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      setUser(firebaseUser)
      setLoading(true)
      setError(null)

      if (firebaseUser) {
        try {
          // Get or create user data in database
          const userRef = ref(database, `users/${firebaseUser.uid}`)
          const snapshot = await get(userRef)

          let userData: User
          if (snapshot.exists()) {
            userData = snapshot.val()
            // Check if we need to reset prompt count (every 12 hours)
            const now = Date.now()
            const twelveHours = 12 * 60 * 60 * 1000
            if (now - userData.lastReset > twelveHours) {
              userData.promptCount = 0
              userData.lastReset = now
              await set(userRef, userData)
            }
          } else {
            // Create new user record
            userData = {
              uid: firebaseUser.uid,
              email: firebaseUser.email || "",
              displayName: firebaseUser.displayName || "",
              photoURL: firebaseUser.photoURL || undefined,
              promptCount: 0,
              lastReset: Date.now(),
            }
            await set(userRef, userData)
          }

          setUserData(userData)
        } catch (err) {
          console.error("Error managing user data:", err)
          setError("Failed to load user data")
        }
      } else {
        setUserData(null)
      }

      setLoading(false)
    })

    return () => unsubscribe()
  }, [])

  const signInWithGoogle = async () => {
    try {
      setError(null)
      await signInWithPopup(auth, googleProvider)
    } catch (err: any) {
      console.error("Sign in error:", err)
      setError(err.message || "Failed to sign in")
    }
  }

  const logout = async () => {
    try {
      setError(null)
      await signOut(auth)
    } catch (err: any) {
      console.error("Sign out error:", err)
      setError(err.message || "Failed to sign out")
    }
  }

  const canSendPrompt = () => {
    return userData && userData.promptCount < 5
  }

  const getRemainingPrompts = () => {
    return userData ? Math.max(0, 5 - userData.promptCount) : 0
  }

  const getTimeUntilReset = () => {
    if (!userData) return 0
    const twelveHours = 12 * 60 * 60 * 1000
    const timeElapsed = Date.now() - userData.lastReset
    return Math.max(0, twelveHours - timeElapsed)
  }

  return {
    user,
    userData,
    loading,
    error,
    signInWithGoogle,
    logout,
    canSendPrompt,
    getRemainingPrompts,
    getTimeUntilReset,
  }
}
