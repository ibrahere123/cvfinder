"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { SearchIcon } from "lucide-react"

export function SearchBar({ initialQuery = "" }: { initialQuery?: string }) {
  const [query, setQuery] = useState(initialQuery)
  const router = useRouter()

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return
    router.push(`/results?q=${encodeURIComponent(query)}`)
  }

  return (
    <form onSubmit={handleSearch} className="flex w-full">
      <div className="relative flex-grow">
        <SearchIcon className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
        <Input
          type="text"
          placeholder="Search for skills, experience, or qualifications"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          className="pl-10 py-2 text-sm rounded-l-md border-gray-300 focus:border-emerald-500 focus:ring-emerald-500 w-full"
        />
      </div>
      <Button type="submit" className="bg-emerald-600 hover:bg-emerald-700 text-white rounded-l-none rounded-r-md">
        Search
      </Button>
    </form>
  )
}
