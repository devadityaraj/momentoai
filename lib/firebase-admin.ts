import { initializeApp, getApps, cert } from "firebase-admin/app"
import { getAuth } from "firebase-admin/auth"
import { getDatabase } from "firebase-admin/database"

const firebaseAdminConfig = {
  credential: cert({
    projectId: process.env.FIREBASE_PROJECT_ID,
    clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
  }),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
}

// Initialize Firebase Admin (singleton pattern)
const app = getApps().length === 0 ? initializeApp(firebaseAdminConfig) : getApps()[0]

export const adminAuth = getAuth(app)
export const adminDatabase = getDatabase(app)

export default app
