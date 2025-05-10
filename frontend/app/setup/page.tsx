import { DatabaseSetupForm } from "@/components/database-setup-form"
import Link from "next/link"

export default function SetupPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white border-b">
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
        </div>
      </header>

      <main className="container mx-auto px-4 py-12">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-900 mb-6">Connect to Your Database</h1>
          <p className="text-lg text-gray-600 mb-8">
            Configure the connection to your internal resume database. This information is used to securely access your
            to your internal resume database. This information is used to securely access your resume data without
            storing any sensitive information on our servers.
          </p>

          <DatabaseSetupForm />
        </div>
      </main>
    </div>
  )
}
