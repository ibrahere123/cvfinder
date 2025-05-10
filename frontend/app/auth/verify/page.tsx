"use client"

import { useEffect, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Loader2, CheckCircle2, XCircle } from "lucide-react"
import { applyActionCode, checkActionCode } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { toast } from "sonner"

export default function VerifyEmailPage() {
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState("")
  const [success, setSuccess] = useState(false)
  const router = useRouter()
  const searchParams = useSearchParams()

  useEffect(() => {
    const oobCode = searchParams.get("oobCode")
    const mode = searchParams.get("mode")

    if (!oobCode || !mode) {
      setError("Invalid verification link")
      setIsVerifying(false)
      return
    }

    const verifyEmail = async () => {
      try {
        // First check if the action code is valid
        await checkActionCode(auth, oobCode)
        
        // Apply the action code to verify the email
        await applyActionCode(auth, oobCode)
        
        setSuccess(true)
        toast.success("Email verified successfully!")
        
        // Force refresh the user's token to update email verification status
        if (auth.currentUser) {
          await auth.currentUser.reload()
        }
      } catch (err: any) {
        const errorMessage = getAuthErrorMessage(err)
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyEmail()
  }, [searchParams])

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <p className="text-sm text-gray-600">Verifying your email...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg text-center">
          <div className="flex justify-center">
            <XCircle className="h-12 w-12 text-red-500" />
          </div>
          <div>
            <h2 className="text-xl font-semibold text-gray-900">Verification Failed</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>
          <Button
            onClick={() => router.push("/auth/signin")}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Back to Sign In
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-6 p-8 bg-white rounded-lg shadow-lg text-center">
        <div className="flex justify-center">
          <CheckCircle2 className="h-12 w-12 text-emerald-500" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Email Verified!</h2>
          <p className="mt-2 text-sm text-gray-600">
            Your email has been successfully verified. You can now sign in to your account.
          </p>
        </div>
        <Button
          onClick={() => router.push("/dashboard")}
          className="w-full bg-emerald-600 hover:bg-emerald-700"
        >
          Continue to Dashboard
        </Button>
      </div>
    </div>
  )
}