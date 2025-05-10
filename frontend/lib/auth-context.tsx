"use client"

import { createContext, useContext, useEffect, useState } from "react"
import { User, onAuthStateChanged, setPersistence, browserLocalPersistence } from "firebase/auth"
import { auth } from "./firebase"

interface AuthContextType {
  user: User | null
  loading: boolean
  setLoading: (loading: boolean) => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  setLoading: () => {},
})

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function initAuth() {
      try {
        await setPersistence(auth, browserLocalPersistence)
        const unsubscribe = onAuthStateChanged(auth, (user) => {
          setUser(user)
          setLoading(false)
        }, (error) => {
          console.error("Auth state change error:", error)
          setUser(null)
          setLoading(false)
        })
        return unsubscribe
      } catch (error) {
        console.error("Error setting persistence:", error)
        setUser(null)
        setLoading(false)
      }
    }
    const unsubscribePromise = initAuth()
    return () => {
      unsubscribePromise.then(unsubscribe => {
        if (unsubscribe) unsubscribe()
      })
    }
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, setLoading }}>
      {children}
    </AuthContext.Provider>
  )
}

export const useAuth = () => {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
