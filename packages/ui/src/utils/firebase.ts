import { initializeApp } from 'firebase/app'
import { getMessaging, getToken, onMessage } from 'firebase/messaging'

// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

// Your web app's Firebase configuration
// For Firebase JS SDK v7.20.0 and later, measurementId is optional
// Config is read from env so each app supplies its own project
// (web -> smile-platform, wms -> indicatorscale).
const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY,
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN,
  databaseURL: process.env.NEXT_PUBLIC_FIREBASE_DATABASE_URL,
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID,
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID,
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID,
}

const app = initializeApp(firebaseConfig)

let messaging: ReturnType<typeof getMessaging> | null = null

if (typeof window !== 'undefined') {
  messaging = getMessaging(app)
}

export const generateToken = async (
  serviceWorkerRegistration?: ServiceWorkerRegistration
): Promise<string | null> => {
  if (!messaging) return null

  try {
    const token = await getToken(messaging, {
      vapidKey: process.env.NEXT_PUBLIC_FIREBASE_VAPID_KEY,
      serviceWorkerRegistration,
    })
    return token
  } catch (error) {
    console.error('Error generating FCM token:', error)
    return null
  }
}

export const onMessageReceived = (callback: (payload: any) => void) => {
  if (messaging && typeof window !== 'undefined') {
    onMessage(messaging, (payload) => {
      callback(payload)
    })
  }
}
