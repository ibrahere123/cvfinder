"use client"
import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowRight } from "lucide-react"

export function SavedCandidates() {
  const [savedCandidates, setSavedCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    setLoading(true)
    setError(null)
    fetch("http://127.0.0.1:8000/saved_candidates")
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.detail || "Failed to fetch saved candidates")
        }
        return res.json()
      })
      .then((data) => {
        setSavedCandidates(data.results || [])
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [])

  if (loading) {
    return <div>Loading saved candidates...</div>
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Saved Candidates</CardTitle>
          <CardDescription>Candidates you've bookmarked</CardDescription>
        </div>
        <Button asChild variant="ghost" size="sm" className="text-emerald-600">
          <Link href="/saved">
            View All
            <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {savedCandidates.map((candidate, index) => (
            <div
              key={index}
              className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-md transition-colors"
            >
              <img
                src={candidate.metadata?.image || "/placeholder.svg"}
                alt={candidate.name || "Candidate"}
                className="w-10 h-10 rounded-full object-cover border border-gray-200"
              />
              <div className="flex-1 min-w-0">
                <div className="font-medium text-gray-900 truncate">{candidate.name || "Unknown"}</div>
                <div className="text-sm text-gray-500 truncate">{candidate.metadata?.title || "N/A"}</div>
              </div>
              <div className="text-sm font-medium text-emerald-600">
                {candidate.metadata?.matching_rate_percent
                  ? candidate.metadata.matching_rate_percent + "%"
                  : "N/A"}
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  )
}
