"use client"

import dynamic from 'next/dynamic'
import { AuthProvider } from "@/lib/auth-context"

const RouteGuard = dynamic(() => import('./route-guard').then(mod => mod.RouteGuard), {
  ssr: false
})

const ToastProvider = dynamic(() => import('./toast-provider').then(mod => mod.ToastProvider), {
  ssr: false
})

export function ClientLayout({ children }: { children: React.ReactNode }) {
  return (
    <AuthProvider>
      <RouteGuard>
        {children}
      </RouteGuard>
      <ToastProvider />
    </AuthProvider>
  )
}