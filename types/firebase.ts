export interface User {
  uid: string
  email: string
  displayName: string
  photoURL?: string
  promptCount: number
  lastReset: number // timestamp
}

export interface Prompt {
  questionID: string
  userID: string
  message: string
  timestamp: number
  status: "queued" | "processing" | "completed" | "error"
}

export interface PromptCondition {
  questionID: string
  status: "queued" | "processing" | "none" | "timeout" | "done" | "completed" | "error" | "rate_limited"
  timestamp?: number
}

export interface Result {
  questionID: string
  response: string
  processingTime: number
  timestamp: number
}

export interface ServerStatus {
  status: "active" | "Down"
  message?: string
  lastUpdate: number
}

export interface FirebaseData {
  prompts: Record<string, Prompt>
  results: Record<string, Result>
  promptcondition: Record<string, PromptCondition>
  serverstatus: ServerStatus
  users: Record<string, User>
}
