"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAuth } from "@/lib/auth-context"
import { doc, updateDoc } from "firebase/firestore"
import { updateProfile } from "firebase/auth"
import { db } from "@/lib/firebase"
import { Loader2 } from "lucide-react"

export function UserProfileForm() {
  const { user } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setSuccess(false)
    setError("")

    const formData = new FormData(e.currentTarget)
    const name = formData.get("name") as string
    const companyName = formData.get("company-name") as string

    try {
      if (user) {
        // Update Firebase Auth profile
        await updateProfile(user, {
          displayName: name
        })

        // Update Firestore document
        const userRef = doc(db, "users", user.uid)
        await updateDoc(userRef, {
          name,
          companyName,
          updatedAt: new Date().toISOString()
        })

        setSuccess(true)
      }
    } catch (err: any) {
      setError(err.message || "Failed to update profile")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-600 px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {success && (
        <div className="bg-green-50 border border-green-200 text-green-600 px-4 py-3 rounded-lg">
          Profile updated successfully
        </div>
      )}

      <div className="space-y-4">
        <div>
          <Label htmlFor="email">Email address</Label>
          <Input
            type="email"
            id="email"
            value={user?.email || ""}
            disabled
            className="mt-1 bg-gray-50"
          />
          <p className="mt-1 text-sm text-gray-500">
            Your email address cannot be changed
          </p>
        </div>

        <div>
          <Label htmlFor="name">Full name</Label>
          <Input
            type="text"
            id="name"
            name="name"
            defaultValue={user?.displayName || ""}
            required
            className="mt-1"
          />
        </div>

        <div>
          <Label htmlFor="company-name">Company name</Label>
          <Input
            type="text"
            id="company-name"
            name="company-name"
            className="mt-1"
          />
        </div>
      </div>

      <div className="flex justify-end">
        <Button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700"
        >
          {isLoading ? (
            <>
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              Saving...
            </>
          ) : (
            "Save changes"
          )}
        </Button>
      </div>
    </form>
  )
}