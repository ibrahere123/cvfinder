import { PricingPlans } from "@/components/pricing-plans"
import { PricingFAQ } from "@/components/pricing-faq"
import { PricingHeader } from "@/components/pricing-header"
import { PricingTestimonials } from "@/components/pricing-testimonials"
import { PricingComparison } from "@/components/pricing-comparison"
import { Footer } from "@/components/footer"
import Link from "next/link"

export default function PricingPage() {
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
            <Link href="/signin" className="text-sm font-medium text-emerald-600 hover:text-emerald-700">
              Sign In
            </Link>
            <Link
              href="/signup"
              className="inline-flex items-center justify-center rounded-md bg-emerald-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-emerald-700"
            >
              Sign Up
            </Link>
          </div>
        </div>
      </header>

      <main>
        <PricingHeader />
        <PricingPlans />
        <PricingComparison />
        <PricingTestimonials />
        <PricingFAQ />
      </main>

      <Footer />
    </div>
  )
}
