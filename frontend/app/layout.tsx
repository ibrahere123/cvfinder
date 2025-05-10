import { Inter } from "next/font/google"
import { Metadata } from "next"
import { Suspense } from "react"
import dynamic from 'next/dynamic'
import "./globals.css"

const ClientWrapper = dynamic(
  () => import('@/components/client-wrapper'),
  { 
    loading: () => <div>Loading...</div>,
    ssr: true 
  }
)

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: 'CVFinder',
  description: 'Find the perfect candidates for your roles',
  generator: 'Next.js',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <body className={inter.className}>
        <Suspense fallback={<div>Loading...</div>}>
          <ClientWrapper>
            {children}
          </ClientWrapper>
        </Suspense>
      </body>
    </html>
  )
}
