import { Search } from "@/components/search"
import { Features } from "@/components/features"
import { Footer } from "@/components/footer"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { FileText } from "lucide-react"

export default function Home() {
  return (
    <div className="min-h-screen bg-white">
      <header className="border-b">
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
            <h1 className="text-xl font-bold text-gray-900">ResumeRanker</h1>
          </div>
          <div className="flex items-center gap-4">
            <Link href="/upload" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 flex items-center">
              <FileText className="h-4 w-4 mr-1" />
              Upload Resume
            </Link>
            <Link href="/auth/signin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Sign In
            </Link>
            <Link
              href="/auth/signup"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <section className="py-24 bg-gradient-to-b from-white to-gray-50">
          <div className="container mx-auto px-4 text-center">
            <h2 className="text-4xl font-bold tracking-tight text-gray-900 sm:text-5xl mb-6">
              Find the perfect candidate in seconds
            </h2>
            <p className="mx-auto max-w-2xl text-lg text-gray-600 mb-10">
              ResumeRanker connects to your internal resume database and uses advanced AI to match job requirements with
              the best available candidates.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button asChild size="lg" className="bg-emerald-600 hover:bg-emerald-700 text-white px-8">
                <Link href="/auth/signup">Get Started</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8"
              >
                <Link href="/results">Try a Demo Search</Link>
              </Button>
              <Button
                asChild
                size="lg"
                variant="outline"
                className="border-emerald-600 text-emerald-600 hover:bg-emerald-50 px-8"
              >
                <Link href="/pricing">Pricing</Link>
              </Button>
            </div>
            <Search />
          </div>
        </section>

        <Features />
      </main>

      <Footer />
    </div>
  )
}
