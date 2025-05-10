"use client"

import { SignUpForm } from "../../../components/sign-up-form"
import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { motion } from "framer-motion"

export default function SignUpPage() {
  return (
    <motion.div className="min-h-screen flex flex-col md:flex-row">
      {/* Left side - Form section */}
      <motion.div
        initial={{ x: -50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="w-full md:w-1/2 flex flex-col p-6 md:p-12 bg-white order-2 md:order-1"
      >
        <div className="md:hidden flex justify-between items-center mb-8">
          <Link href="/" className="flex items-center gap-2">
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
            <span className="text-xl font-bold text-gray-900">ResumeRanker</span>
          </Link>
        </div>

        <div className="flex-1 flex flex-col justify-center max-w-md mx-auto w-full">
          <Link href="/" className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600 mb-8">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to home
          </Link>

          <h2 className="text-3xl font-bold text-gray-900 mb-2">Create your account</h2>
          <p className="text-gray-600 mb-8">Sign up to start finding the perfect candidates faster.</p>

          <SignUpForm />
          <div className="mt-6 text-center">
            <p className="text-sm text-gray-600">
              Already have an account?{" "}
              <Link href="/auth/signin" className="font-medium text-emerald-600 hover:text-emerald-500">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </motion.div>

      {/* Right side - Visual section */}
      <motion.div
        initial={{ x: 50, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.2 }}
        className="hidden md:flex md:w-1/2 bg-gradient-to-br from-teal-400 via-emerald-500 to-emerald-600 text-white p-12 relative overflow-hidden order-1 md:order-2"
      >
        <div className="absolute inset-0 bg-[url('/placeholder.svg?height=800&width=800')] opacity-10 bg-repeat"></div>
        <div className="absolute inset-0 bg-gradient-to-br from-teal-400/80 via-emerald-500/80 to-emerald-600/80"></div>

        {/* Decorative circles */}
        <div className="absolute top-20 right-20 w-64 h-64 bg-white/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 left-20 w-80 h-80 bg-teal-300/20 rounded-full blur-3xl"></div>

        <div className="relative z-10 flex flex-col h-full justify-between">
          <div>
            <Link href="/" className="flex items-center gap-2 mb-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                className="h-8 w-8"
              >
                <path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 0 2 2h1" />
                <path d="M17 3h1a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-1" />
                <path d="M8 21h8" />
                <path d="M12 3v18" />
              </svg>
              <span className="text-2xl font-bold">ResumeRanker</span>
            </Link>
            <h1 className="text-4xl font-bold mb-6">Find your ideal candidates faster</h1>
            <p className="text-xl opacity-90 mb-8">
              ResumeRanker helps you identify the best talent in your database with AI-powered matching.
            </p>
          </div>

          <div className="bg-white/10 rounded-xl p-6 backdrop-blur-sm border border-white/20">
            <div className="flex items-center gap-4 mb-4">
              <img src="/placeholder.svg?height=48&width=48" alt="User" className="w-12 h-12 rounded-full" />
              <div>
                <div className="font-medium">Sarah Johnson</div>
                <div className="text-sm opacity-80">HR Director, Acme Inc</div>
              </div>
            </div>
            <p className="italic opacity-90">
              "ResumeRanker has transformed our hiring process. We've reduced time-to-hire by 60% and found better
              candidates for our roles."
            </p>
          </div>
        </div>
      </motion.div>
    </motion.div>
  )
}
