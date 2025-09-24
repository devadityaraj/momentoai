"use client"

import "@testing-library/jest-dom"
import jest from "jest"

// Mock Firebase
jest.mock("./lib/firebase", () => ({
  auth: {},
  googleProvider: {},
  database: {},
}))

// Mock Firebase Admin
jest.mock("./lib/firebase-admin", () => ({
  adminAuth: {},
  adminDatabase: {},
}))

// Mock Next.js router
jest.mock("next/router", () => ({
  useRouter() {
    return {
      route: "/",
      pathname: "/",
      query: "",
      asPath: "",
      push: jest.fn(),
      pop: jest.fn(),
      reload: jest.fn(),
      back: jest.fn(),
      prefetch: jest.fn(),
      beforePopState: jest.fn(),
      events: {
        on: jest.fn(),
        off: jest.fn(),
        emit: jest.fn(),
      },
    }
  },
}))
