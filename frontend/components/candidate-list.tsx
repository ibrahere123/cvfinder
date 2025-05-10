"use client"

import { useState, useEffect } from "react"
import { Card, CardContent } from "./ui/card"
import { Badge } from "./ui/badge"
import { Button } from "./ui/button"
import { Bookmark, MapPin, Briefcase, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

export function CandidateList({ query }: { query: string }) {
  const [candidates, setCandidates] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [topK, setTopK] = useState(5)
  const [totalCount, setTotalCount] = useState(0)
  const { toast } = useToast()

  useEffect(() => {
    if (!query || query.trim() === "") {
      setCandidates([])
      return
    }

    setLoading(true)
    setError(null)

    const requestBody = { query, k: topK }

    fetch("http://127.0.0.1:8000/search_resumes", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(requestBody),
    })
      .then(async (res) => {
        if (!res.ok) {
          const errorData = await res.json()
          throw new Error(errorData.detail || "Failed to fetch search results")
        }
        return res.json()
      })
      .then((data) => {
        setCandidates(data.results || [])
        setTotalCount(data.total_count || 0)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.message)
        setLoading(false)
      })
  }, [query, topK])

  if (loading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3, 4].map((i) => (
          <Card key={i} className="animate-pulse">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-gray-200 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-6 bg-gray-200 rounded w-1/3 mb-2"></div>
                  <div className="h-4 bg-gray-200 rounded w-1/2 mb-4"></div>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {[1, 2, 3, 4].map((j) => (
                      <div key={j} className="h-6 bg-gray-200 rounded w-16"></div>
                    ))}
                  </div>
                  <div className="flex justify-between items-center">
                    <div className="h-4 bg-gray-200 rounded w-1/4"></div>
                    <div className="h-8 bg-gray-200 rounded w-24"></div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    )
  }

  if (error) {
    return <div className="text-red-600">Error: {error}</div>
  }

  return (
    <div>
      <div className="mb-4">
        <label htmlFor="topK" className="mr-2 font-semibold text-gray-700">
          Number of candidates to show:
        </label>
        <select
          id="topK"
          value={topK}
          onChange={(e) => setTopK(Number(e.target.value))}
          className="border border-gray-300 rounded px-2 py-1"
        >
          {[5, 10, 15, 20].map((num) => (
            <option key={num} value={num}>
              {num}
            </option>
          ))}
        </select>
      </div>
      {!loading && !error && candidates.length > 0 && (
        <div className="mb-4 font-semibold text-gray-700">
          Found {totalCount} candidates matching your criteria in your database
        </div>
      )}
      <div className="space-y-4">
        {candidates.map((candidate, index) => (
          <Card key={index} className="hover:shadow-md transition-shadow">
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <img
                  src={candidate.metadata?.image || "/placeholder.svg"}
                  alt={candidate.metadata?.name || "Candidate"}
                  className="w-16 h-16 rounded-full object-cover border border-gray-200"
                />
                <div className="flex-1">
                  <div className="flex justify-between items-start">
                    <div>
                      <h3 className="text-lg font-semibold text-gray-900">{candidate.metadata?.name || "Unknown"}</h3>
                      <p className="text-gray-600">{candidate.metadata?.title || candidate.metadata?.position || "N/A"}</p>
                    </div>
                    <div className="flex items-center gap-1">
                      <span className="text-lg font-bold text-emerald-600">
                        {candidate.matching_rate_percent ? candidate.matching_rate_percent + "%" : "N/A"}
                      </span>
                      <span className="text-sm text-gray-500">match</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2 my-3">
                    {(candidate.metadata?.skills || []).slice(0, 3).map((skill: string) => (
                      <Badge
                        key={skill}
                        variant="secondary"
                        className="bg-emerald-50 text-emerald-700 hover:bg-emerald-100"
                      >
                        {skill}
                      </Badge>
                    ))}
                    {(candidate.metadata?.skills || []).length > 3 && (
                      <Badge variant="outline" className="text-gray-500">
                        +{candidate.metadata.skills.length - 3} more
                      </Badge>
                    )}
                  </div>

                  <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-4">
                    <div className="flex items-center gap-1">
                      <MapPin className="h-4 w-4 text-gray-400" />
                      {candidate.metadata?.location || "N/A"}
                    </div>
                    <div className="flex items-center gap-1">
                      <Briefcase className="h-4 w-4 text-gray-400" />
                      {candidate.metadata?.total_experience || "N/A"}
                    </div>
                  </div>

                  <div className="flex justify-between items-center">
                    <Button
                      variant="outline"
                      size="sm"
                      className="text-gray-600"
                      onClick={async () => {
                        try {
                          const response = await fetch("http://127.0.0.1:8000/save_candidate", {
                            method: "POST",
                            headers: {
                              "Content-Type": "application/json",
                            },
                            body: JSON.stringify({ file: candidate.file }),
                          });
                          if (!response.ok) {
                            const errorData = await response.json();
                            throw new Error(errorData.detail || "Failed to save candidate");
                          }
                          toast({
                            title: "Candidate Saved",
                            description: `${candidate.metadata?.name || "Candidate"} has been saved successfully.`,
                            duration: 4000,
                            variant: "success",
                          });
                        } catch (error) {
                          toast({
                            title: "Error",
                            description: `Error saving candidate: ${error.message}`,
                            duration: 4000,
                            variant: "destructive",
                          });
                        }
                      }}
                    >
                      <Bookmark className="h-4 w-4 mr-1" />
                      Save
                    </Button>
                    <Button className="bg-emerald-600 hover:bg-emerald-700 text-white" onClick={() => window.open(`http://127.0.0.1:8000/resumes/${encodeURIComponent(candidate.file)}`, '_blank')}>
                      <ExternalLink className="h-4 w-4 mr-1" />
                      View Resume
                    </Button>
                    <Button variant="outline" size="sm" className="text-gray-600 ml-2" onClick={() => {
                      const link = document.createElement('a');
                      link.href = `http://127.0.0.1:8000/resumes/${encodeURIComponent(candidate.file)}`;
                      link.download = candidate.metadata?.name ? `${candidate.metadata.name}-resume` : 'resume';
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}>
                      <Bookmark className="h-4 w-4 mr-1" />
                      Download Resume
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
