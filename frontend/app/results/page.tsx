"use client"

import { CandidateList } from "../../components/candidate-list"
import { SearchBar } from "../../components/search-bar"
import { useAuth } from "@/lib/auth-context"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { signOut } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useRouter } from "next/navigation"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { User, LogOut } from "lucide-react"

export default function ResultsPage({
  searchParams,
}: {
  searchParams: { q: string }
}) {
  const { user } = useAuth()
  const router = useRouter()
  const query = searchParams.q || ""

  const handleSignOut = async () => {
    try {
      await signOut(auth)
      router.push("/auth/signin")
    } catch (error) {
      console.error("Error signing out:", error)
    }
  }

  return (
    <div key={user?.uid} className="min-h-screen bg-gray-50">
      <header className="bg-white border-b sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              className="h-6 w-6 text-emerald-600"
            >
              <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1" />
              <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
              <path d="M8 21h8" />
              <path d="M12 3v18" />
            </svg>
            <Link href="/" className="text-xl font-bold text-gray-900">
              ResumeRanker
            </Link>
          </div>
          <div className="flex-1 max-w-2xl mx-4">
            <SearchBar initialQuery={query} />
          </div>
          <div className="flex items-center gap-4">
            {user ? (
              <>
                <Link 
                  href="/dashboard" 
                  className="inline-flex items-center justify-center rounded-md px-4 py-2 text-sm font-medium text-emerald-600 hover:text-emerald-700"
                >
                  Dashboard
                </Link>
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="ghost" 
                      className="flex items-center gap-2 hover:bg-gray-100 px-4"
                    >
                      <User className="h-4 w-4" />
                      <span className="font-medium hidden md:inline">
                        {user.displayName || user.email?.split('@')[0]}
                      </span>
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent align="end" className="w-52">
                    <div className="px-2 py-1.5 text-sm text-gray-500 md:hidden">
                      Signed in as <span className="font-medium text-gray-900">{user.displayName || user.email?.split('@')[0]}</span>
                    </div>
                    <DropdownMenuSeparator className="md:hidden" />
                    <DropdownMenuItem asChild>
                      <Link href="/settings/profile" className="w-full">Profile Settings</Link>
                    </DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleSignOut}
                      className="text-red-600 focus:text-red-600"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sign Out
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <Link
                href="/auth/signin"
                className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <div className="bg-white p-6 rounded-lg shadow-sm mb-6">
          <h1 className="text-xl font-semibold text-gray-900">
            Results for: <span className="text-emerald-600">{query}</span>
          </h1>
          <p className="text-gray-600">Candidates matching your criteria in your database</p>
        </div>
        <CandidateList query={query} />
      </main>
    </div>
  )
}
