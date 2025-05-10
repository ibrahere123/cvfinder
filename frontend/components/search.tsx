"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { SearchIcon } from "lucide-react"

export function Search() {
  const [query, setQuery] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setIsLoading(true)
    // In a real app, you would validate and process the query here
    setTimeout(() => {
      router.push(`/results?q=${encodeURIComponent(query)}`)
      setIsLoading(false)
    }, 800)
  }

  return (
    <div className="mx-auto max-w-2xl">
      <form onSubmit={handleSearch} className="flex flex-col md:flex-row gap-3">
        <div className="relative flex-grow">
          <SearchIcon className="absolute left-3 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
          <Input
            type="text"
            placeholder="e.g., Python developer with AWS experience"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="pl-10 py-6 text-base rounded-lg border-gray-300 shadow-sm focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <Button
          type="submit"
          className="bg-emerald-600 hover:bg-emerald-700 text-white py-6 px-8 rounded-lg"
          disabled={isLoading}
        >
          {isLoading ? "Searching..." : "Find Candidates"}
        </Button>
      </form>
    </div>
  )
}
