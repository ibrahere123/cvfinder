import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAuth } from 'firebase/auth'
import { getFirestore } from 'firebase/firestore'

const firebaseConfig = {
  apiKey: process.env.NEXT_PUBLIC_FIREBASE_API_KEY || 'AIzaSyBwpFXb2ycYfwJU5LqQosE1ElqEvjnYMcQ',
  authDomain: process.env.NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN || 'resumeranker-368ba.firebaseapp.com',
  projectId: process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || 'resumeranker-368ba',
  storageBucket: process.env.NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET || 'resumeranker-368ba.firebasestorage.app',
  messagingSenderId: process.env.NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID || '876197574187',
  appId: process.env.NEXT_PUBLIC_FIREBASE_APP_ID || '1:876197574187:web:9eff9a8343ca6846b25c6e',
  measurementId: process.env.NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID || 'G-H75MVDLG8R',
}

let app
try {
  app = getApps().length ? getApp() : initializeApp(firebaseConfig)
} catch (error: any) {
  console.error('Error initializing Firebase:', error)
  throw new Error('Failed to initialize Firebase. Check your configuration.')
}

const auth = getAuth(app)
const db = getFirestore(app)

export { app, auth, db }