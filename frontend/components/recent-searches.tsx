"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Search, Clock, ArrowRight, Users } from "lucide-react"

interface RecentSearch {
  id: number
  query: string
  date: string
  results: number
  matchScore: number
}

async function fetchRecentSearches(): Promise<RecentSearch[]> {
  try {
    const response = await fetch("http://localhost:8000/recent_searches");
    if (!response.ok) {
      throw new Error("Failed to fetch recent searches");
    }
    const data = await response.json();
    return data.recent_searches;
  } catch (error) {
    throw new Error("Failed to fetch recent searches");
  }
}

export function RecentSearches() {
  const [recentSearches, setRecentSearches] = useState<RecentSearch[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetchRecentSearches()
      .then((data) => {
        setRecentSearches(data)
        setLoading(false)
      })
      .catch(() => {
        setError("Failed to load recent searches")
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading recent searches...</div>
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Recent Searches</CardTitle>
          <CardDescription>Your recent candidate searches</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-emerald-600">
          <Link href="/search-history">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {recentSearches.map((search) => (
            <div key={search.id} className="border border-gray-100 rounded-lg p-4 hover:shadow-sm transition-shadow">
              <div className="flex justify-between items-start mb-2">
                <div className="flex items-center gap-2">
                  <Search className="h-4 w-4 text-emerald-600" />
                  <Link
                    href={`/results?q=${encodeURIComponent(search.query)}`}
                    className="font-medium text-gray-900 hover:text-emerald-600"
                  >
                    {search.query}
                  </Link>
                </div>
                <div className="text-xs text-gray-500 flex items-center">
                  <Clock className="h-3 w-3 mr-1" />
                  {search.date}
                </div>
              </div>
              <div className="flex justify-between items-center">
                <div className="flex items-center gap-1 text-sm text-gray-600">
                  <Users className="h-4 w-4 text-gray-400" />
                  <span>{search.results} candidates</span>
                </div>
                <div className="text-sm">
                  <span className="font-medium text-emerald-600">{search.matchScore}%</span>
                  <span className="text-gray-500 ml-1">avg. match</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
