"use client"

import { renderHook } from "@testing-library/react"
import { useAuth } from "@/hooks/use-auth"
import jest from "jest"

// Mock Firebase auth functions
const mockOnAuthStateChanged = jest.fn()
const mockSignInWithPopup = jest.fn()
const mockSignOut = jest.fn()

jest.mock("firebase/auth", () => ({
  onAuthStateChanged: (...args: any[]) => mockOnAuthStateChanged(...args),
  signInWithPopup: (...args: any[]) => mockSignInWithPopup(...args),
  signOut: (...args: any[]) => mockSignOut(...args),
  GoogleAuthProvider: jest.fn(),
}))

jest.mock("firebase/database", () => ({
  ref: jest.fn(),
  set: jest.fn(),
  get: jest.fn(() => Promise.resolve({ exists: () => false })),
}))

describe("useAuth", () => {
  beforeEach(() => {
    jest.clearAllMocks()
  })

  it("initializes with loading state", () => {
    const { result } = renderHook(() => useAuth())

    expect(result.current.loading).toBe(true)
    expect(result.current.user).toBe(null)
    expect(result.current.userData).toBe(null)
  })

  it("provides rate limiting functions", () => {
    const { result } = renderHook(() => useAuth())

    expect(typeof result.current.canSendPrompt).toBe("function")
    expect(typeof result.current.getRemainingPrompts).toBe("function")
    expect(typeof result.current.getTimeUntilReset).toBe("function")
  })
})
