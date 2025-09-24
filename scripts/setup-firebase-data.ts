import * as admin from "firebase-admin"
import * as dotenv from "dotenv"

dotenv.config()

// Initialize Firebase Admin
const serviceAccount = {
  projectId: process.env.FIREBASE_PROJECT_ID,
  clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
  privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
}

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount as admin.ServiceAccount),
  databaseURL: process.env.FIREBASE_DATABASE_URL,
})

const db = admin.database()

async function setupInitialData() {
  try {
    console.log("Setting up initial Firebase data...")

    // Set initial server status
    await db.ref("serverstatus").set({
      status: "Down",
      message: "Worker not started",
      lastUpdate: Date.now(),
    })

    console.log("✅ Initial server status set")

    // Create empty nodes for proper structure
    await db.ref("prompts").set({})
    await db.ref("results").set({})
    await db.ref("promptcondition").set({})

    console.log("✅ Database structure initialized")
    console.log("🎉 Firebase setup complete!")

    process.exit(0)
  } catch (error) {
    console.error("❌ Error setting up Firebase:", error)
    process.exit(1)
  }
}

setupInitialData()
