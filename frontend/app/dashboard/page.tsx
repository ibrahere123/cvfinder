import { DashboardHeader } from "@/components/dashboard-header"
import { RecentSearches } from "@/components/recent-searches"
import { SavedCandidates } from "@/components/saved-candidates"

export default function DashboardPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardHeader />

      <main className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold text-gray-900 mb-6">Dashboard</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
          <div className="lg:col-span-2">
            <RecentSearches />
          </div>
          <div>
            <SavedCandidates />
          </div>
        </div>
      </main>
    </div>
  )
}
