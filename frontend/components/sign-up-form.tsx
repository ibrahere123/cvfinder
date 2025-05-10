"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { useRouter } from "next/navigation"
import { Loader2 } from "lucide-react"
import Link from "next/link"
import { createUserWithEmailAndPassword, updateProfile, GoogleAuthProvider, signInWithPopup, sendEmailVerification } from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, setDoc } from "firebase/firestore"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { PasswordInput } from "@/components/ui/password-input"
import { usePasswordValidation } from "@/hooks/use-password-validation"

export function SignUpForm() {
  const { setLoading: setGlobalLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const router = useRouter()
  const { isValid } = usePasswordValidation(password)

  const validateForm = (formData: FormData) => {
    const email = formData.get("email") as string
    const name = formData.get("name") as string
    const companyName = formData.get("company-name") as string
    const terms = formData.get("terms")

    if (!email || !name || !companyName || !password) {
      throw new Error("Please fill in all required fields")
    }

    if (!terms) {
      throw new Error("Please accept the terms and conditions")
    }

    if (!isValid) {
      throw new Error("Please choose a stronger password")
    }
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setError("")
    setGlobalLoading(true)

    const formData = new FormData(e.currentTarget)

    try {
      validateForm(formData)

      const email = formData.get("email") as string
      const name = formData.get("name") as string
      const companyName = formData.get("company-name") as string

      // Create user with email and password
      const userCredential = await createUserWithEmailAndPassword(auth, email, password)
      const user = userCredential.user

      // Update user profile
      await updateProfile(user, {
        displayName: name
      })

      // Send email verification
      await sendEmailVerification(user)

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email,
        name,
        companyName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      toast.success("Account created successfully! Please check your email for verification.")
      router.push("/auth/verify-email")
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setGlobalLoading(false)
    }
  }

  const handleGoogleSignUp = async () => {
    setIsLoading(true)
    setError("")
    setGlobalLoading(true)

    try {
      const provider = new GoogleAuthProvider()
      const result = await signInWithPopup(auth, provider)
      const user = result.user

      // Store additional user data in Firestore
      await setDoc(doc(db, "users", user.uid), {
        email: user.email,
        name: user.displayName,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      })

      toast.success("Successfully signed in with Google!")
      router.push("/dashboard")
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err)
      setError(errorMessage)
      toast.error(errorMessage)
      setIsLoading(false)
    } finally {
      setGlobalLoading(false)
    }
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      <div className="space-y-5">
        <div>
          <Label htmlFor="company-name" className="text-gray-700">
            Company name
          </Label>
          <div className="mt-1">
            <Input
              id="company-name"
              name="company-name"
              type="text"
              required
              className="block w-full"
              placeholder="Acme Inc."
            />
          </div>
        </div>

        <div>
          <Label htmlFor="name" className="text-gray-700">
            Full name
          </Label>
          <div className="mt-1">
            <Input
              id="name"
              name="name"
              type="text"
              required
              className="block w-full"
              placeholder="Your full name"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="email" className="text-gray-700">
            Email address
          </Label>
          <div className="mt-1">
            <Input
              id="email"
              name="email"
              type="email"
              autoComplete="email"
              required
              className="block w-full"
              placeholder="you@company.com"
            />
          </div>
        </div>

        <PasswordInput
          label="Password"
          value={password}
          onChange={setPassword}
          showStrengthMeter
          showCriteria
        />
      </div>

      <div className="flex items-center">
        <Checkbox
          id="terms"
          name="terms"
          required
          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
        />
        <label htmlFor="terms" className="ml-2 block text-sm text-gray-600">
          I agree to the{" "}
          <a href="#" className="text-emerald-600 hover:text-emerald-500">
            Terms of Service
          </a>{" "}
          and{" "}
          <a href="#" className="text-emerald-600 hover:text-emerald-500">
            Privacy Policy
          </a>
        </label>
      </div>

      <Button type="submit" disabled={isLoading} className="w-full bg-emerald-600 hover:bg-emerald-700">
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          "Sign up"
        )}
      </Button>

      <div className="mt-6">
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-gray-300" />
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-2 bg-white text-gray-500">Or continue with</span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-2 gap-3">
          <Button
            variant="outline"
            type="button"
            onClick={handleGoogleSignUp}
            className="w-full"
          >
            <svg className="h-5 w-5 mr-2" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path
                d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                fill="#4285F4"
              />
              <path
                d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                fill="#34A853"
              />
              <path
                d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                fill="#FBBC05"
              />
              <path
                d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                fill="#EA4335"
              />
            </svg>
            Google
          </Button>

          <Button
            variant="outline"
            type="button"
            disabled
            className="w-full"
          >
            <svg className="h-5 w-5 mr-2 text-blue-600" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
              <path
                fillRule="evenodd"
                d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                clipRule="evenodd"
              />
            </svg>
            Facebook
          </Button>
        </div>
      </div>

      <div className="mt-6 text-center">
        <p className="text-sm text-gray-600">
          Already have an account?{" "}
          <Link href="/auth/signin" className="font-medium text-emerald-600 hover:text-emerald-500">
            Sign in
          </Link>
        </p>
      </div>
    </form>
  )
}
