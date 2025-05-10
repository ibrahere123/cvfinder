"use client"

import { DashboardHeader } from "@/components/dashboard-header"
import { UserProfileForm } from "@/components/user-profile-form"

export default function SettingsPage() {
  return (
    <div>
      <DashboardHeader />
      <main className="container mx-auto px-4 py-8">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-2xl font-bold text-gray-900 mb-8">Account Settings</h1>
          <UserProfileForm />
        </div>
      </main>
    </div>
  )
}