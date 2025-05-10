"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, ArrowLeft, Mail } from "lucide-react"
import Link from "next/link"
import { useAuth } from "@/lib/auth-context"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { toast } from "sonner"

export function ForgotPasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const { setLoading: setGlobalLoading } = useAuth()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setSuccess(false)
    setGlobalLoading(true)

    const formData = new FormData(e.currentTarget)
    const email = formData.get("email") as string

    try {
      await sendPasswordResetEmail(auth, email)
      setSuccess(true)
      toast.success("Password reset email sent successfully!")
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setGlobalLoading(false)
    }
  }

  if (success) {
    return (
      <div className="text-center space-y-6">
        <div className="flex justify-center">
          <div className="bg-emerald-100 rounded-full p-3">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
        </div>
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-gray-900">Check your email</h3>
          <p className="text-sm text-gray-600">
            We have sent you a password reset link. Please check your email and follow the instructions.
          </p>
        </div>
        <Link
          href="/auth/signin"
          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div>
        <Label htmlFor="email">Email address</Label>
        <div className="mt-1">
          <Input
            id="email"
            name="email"
            type="email"
            autoComplete="email"
            required
            className="block w-full"
            placeholder="Enter your email"
          />
        </div>
        <p className="mt-2 text-sm text-gray-500">
          We'll send you a link to reset your password.
        </p>
      </div>

      <Button
        type="submit"
        className="w-full bg-emerald-600 hover:bg-emerald-700"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending reset instructions...
          </>
        ) : (
          "Send reset instructions"
        )}
      </Button>

      <div className="text-center">
        <Link
          href="/auth/signin"
          className="inline-flex items-center text-sm text-emerald-600 hover:text-emerald-500"
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Back to sign in
        </Link>
      </div>
    </form>
  )
}
