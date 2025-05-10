"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, Mail } from "lucide-react"
import { sendEmailVerification } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const [isResending, setIsResending] = useState(false)
  const router = useRouter()
  const { user } = useAuth()

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  const handleResendVerification = async () => {
    setIsResending(true)
    try {
      await sendEmailVerification(user)
      toast.success("Verification email sent successfully!")
    } catch (err: any) {
      toast.error("Failed to send verification email. Please try again later.")
    } finally {
      setIsResending(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-emerald-100">
            <Mail className="h-6 w-6 text-emerald-600" />
          </div>
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Check your email</h2>
          <p className="mt-2 text-sm text-gray-600">
            We sent a verification link to{" "}
            <span className="font-medium text-emerald-600">{user.email}</span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Click the link in the email to verify your account.
          </p>
        </div>

        <div className="mt-8 space-y-4">
          <Button
            onClick={handleResendVerification}
            variant="outline"
            className="w-full border-emerald-600 text-emerald-600 hover:bg-emerald-50"
            disabled={isResending}
          >
            {isResending ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resending...
              </>
            ) : (
              "Resend verification email"
            )}
          </Button>

          <div className="text-center">
            <button
              onClick={() => router.push("/auth/signin")}
              className="text-sm font-medium text-emerald-600 hover:text-emerald-500"
            >
              Back to sign in
            </button>
          </div>
        </div>

        <div className="mt-8 border-t border-gray-200 pt-6">
          <p className="text-xs text-center text-gray-500">
            Didn't receive the email? Check your spam folder or try resending the verification email.
          </p>
        </div>
      </div>
    </div>
  )
}