'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { ClientLayout } from './client-layout'

const publicPaths = ['/', '/auth/signin', '/auth/signup', '/results']

export default function ClientWrapper({
  children
}: {
  children: React.ReactNode
}) {
  const pathname = usePathname()
  const isPublicRoute = publicPaths.includes(pathname)

  useEffect(() => {
    // Prefetch public routes
    if (isPublicRoute) {
      const link = document.createElement('link')
      link.rel = 'prefetch'
      link.href = pathname
      document.head.appendChild(link)
    }
  }, [pathname, isPublicRoute])

  return <ClientLayout>{children}</ClientLayout>
}