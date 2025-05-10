"use client"

import { useRouter, usePathname } from "next/navigation"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

const navItems = [
  {
    label: "Profile",
    href: "/settings/profile",
  },
  {
    label: "Preferences",
    href: "/settings/preferences",
  },
  {
    label: "Notifications",
    href: "/settings/notifications",
  },
]

export default function SettingsLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const router = useRouter()
  const pathname = usePathname()

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="py-6">
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>

          <div className="mt-6 grid grid-cols-12 gap-6">
            {/* Sidebar Navigation */}
            <aside className="col-span-12 sm:col-span-3">
              <nav className="space-y-1">
                {navItems.map((item) => (
                  <Button
                    key={item.href}
                    variant="ghost"
                    className={cn(
                      "w-full justify-start",
                      pathname === item.href
                        ? "bg-emerald-50 text-emerald-600"
                        : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                    )}
                    onClick={() => router.push(item.href)}
                  >
                    {item.label}
                  </Button>
                ))}
              </nav>
            </aside>

            {/* Main Content */}
            <main className="col-span-12 sm:col-span-9 bg-white shadow rounded-lg">
              {children}
            </main>
          </div>
        </div>
      </div>
    </div>
  )
}