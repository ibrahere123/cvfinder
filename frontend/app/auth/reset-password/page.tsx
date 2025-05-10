"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth"
import { auth } from "@/lib/firebase"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { toast } from "sonner"
import { PasswordInput } from "@/components/ui/password-input"
import { usePasswordValidation } from "@/hooks/use-password-validation"

export default function ResetPasswordPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [isVerifying, setIsVerifying] = useState(true)
  const [error, setError] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [actionCode, setActionCode] = useState<string | null>(null)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { isValid } = usePasswordValidation(password)

  useEffect(() => {
    const oobCode = searchParams.get("oobCode")
    if (!oobCode) {
      setError("Invalid password reset link")
      setIsVerifying(false)
      return
    }

    const verifyCode = async () => {
      try {
        await verifyPasswordResetCode(auth, oobCode)
        setActionCode(oobCode)
      } catch (err: any) {
        const errorMessage = getAuthErrorMessage(err)
        setError(errorMessage)
        toast.error(errorMessage)
      } finally {
        setIsVerifying(false)
      }
    }

    verifyCode()
  }, [searchParams])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!actionCode || !isValid) return

    setIsLoading(true)
    setError("")

    if (password !== confirmPassword) {
      setError("Passwords do not match")
      toast.error("Passwords do not match")
      setIsLoading(false)
      return
    }

    try {
      await confirmPasswordReset(auth, actionCode, password)
      toast.success("Password has been reset successfully!")
      router.push("/auth/signin")
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
    }
  }

  if (isVerifying) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="flex justify-center">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
          </div>
          <p className="text-center text-sm text-gray-600">Verifying reset link...</p>
        </div>
      </div>
    )
  }

  if (error && !actionCode) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
          <div className="text-center">
            <h2 className="text-xl font-semibold text-gray-900">Invalid Reset Link</h2>
            <p className="mt-2 text-sm text-gray-600">{error}</p>
          </div>
          <Button
            onClick={() => router.push("/auth/forgot-password")}
            className="w-full bg-emerald-600 hover:bg-emerald-700"
          >
            Request New Reset Link
          </Button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <h2 className="mt-6 text-3xl font-bold text-gray-900">Reset your password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Please enter your new password below.
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {error && (
            <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
              {error}
            </div>
          )}

          <div className="space-y-4">
            <PasswordInput
              label="New Password"
              value={password}
              onChange={setPassword}
              showStrengthMeter
              showCriteria
            />

            <div>
              <Label htmlFor="confirm-password">Confirm New Password</Label>
              <PasswordInput
                id="confirm-password"
                name="confirm-password"
                label=""
                value={confirmPassword}
                onChange={setConfirmPassword}
                showStrengthMeter={false}
                showCriteria={false}
              />
            </div>
          </div>

          <Button
            type="submit"
            className="w-full bg-emerald-600 hover:bg-emerald-700"
            disabled={isLoading || !isValid || !password || !confirmPassword}
          >
            {isLoading ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Resetting password...
              </>
            ) : (
              "Reset Password"
            )}
          </Button>
        </form>
      </div>
    </div>
  )
}