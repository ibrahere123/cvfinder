"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2 } from "lucide-react"
import { useRouter } from "next/navigation"
import {
  updateProfile,
  updateEmail,
  updatePassword,
  EmailAuthProvider,
  reauthenticateWithCredential,
  sendEmailVerification
} from "firebase/auth"
import { auth, db } from "@/lib/firebase"
import { doc, updateDoc } from "firebase/firestore"
import { getAuthErrorMessage } from "@/lib/auth-errors"
import { useAuth } from "@/lib/auth-context"
import { toast } from "sonner"
import { PasswordInput } from "@/components/ui/password-input"
import { usePasswordValidation } from "@/hooks/use-password-validation"

export default function ProfilePage() {
  const { user, setLoading: setGlobalLoading } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const router = useRouter()
  const { isValid: isNewPasswordValid } = usePasswordValidation(newPassword)

  if (!user) {
    router.push("/auth/signin")
    return null
  }

  const handleUpdateProfile = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setGlobalLoading(true)

    const formData = new FormData(e.currentTarget)
    const displayName = formData.get("name") as string
    const newEmail = formData.get("email") as string

    try {
      // If email is being changed, require reauthentication
      if (newEmail !== user.email) {
        if (!currentPassword) {
          toast.error("Please enter your current password to change email")
          return
        }

        const credential = EmailAuthProvider.credential(
          user.email!,
          currentPassword
        )
        await reauthenticateWithCredential(user, credential)
        await updateEmail(user, newEmail)
        await sendEmailVerification(user)
        toast.success("Email updated! Please verify your new email address.")
      }

      // Update display name if changed
      if (displayName !== user.displayName) {
        await updateProfile(user, { displayName })
        await updateDoc(doc(db, "users", user.uid), {
          name: displayName,
          updatedAt: new Date().toISOString()
        })
        toast.success("Profile updated successfully!")
      }

      // Update password if provided
      if (newPassword) {
        if (!currentPassword) {
          toast.error("Please enter your current password to change password")
          return
        }

        if (!isNewPasswordValid) {
          toast.error("New password does not meet requirements")
          return
        }

        const credential = EmailAuthProvider.credential(
          user.email!,
          currentPassword
        )
        await reauthenticateWithCredential(user, credential)
        await updatePassword(user, newPassword)
        toast.success("Password updated successfully!")
        setNewPassword("")
      }

      setCurrentPassword("")
    } catch (err: any) {
      const errorMessage = getAuthErrorMessage(err)
      toast.error(errorMessage)
    } finally {
      setIsLoading(false)
      setGlobalLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <div className="space-y-8">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Profile Settings</h2>
          <p className="mt-1 text-sm text-gray-600">
            Update your account settings and change your password
          </p>
        </div>

        <form onSubmit={handleUpdateProfile} className="space-y-6">
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Full Name</Label>
              <Input
                id="name"
                name="name"
                type="text"
                defaultValue={user.displayName || ""}
                className="mt-1"
              />
            </div>

            <div>
              <Label htmlFor="email">Email Address</Label>
              <Input
                id="email"
                name="email"
                type="email"
                defaultValue={user.email || ""}
                className="mt-1"
              />
              {!user.emailVerified && (
                <p className="mt-1 text-sm text-amber-600">
                  Please verify your email address.{" "}
                  <button
                    type="button"
                    onClick={async () => {
                      try {
                        await sendEmailVerification(user)
                        toast.success("Verification email sent!")
                      } catch (err) {
                        toast.error("Failed to send verification email")
                      }
                    }}
                    className="text-emerald-600 hover:text-emerald-500"
                  >
                    Resend verification email
                  </button>
                </p>
              )}
            </div>

            <div>
              <Label htmlFor="current-password">Current Password</Label>
              <PasswordInput
                id="current-password"
                name="current-password"
                label=""
                value={currentPassword}
                onChange={setCurrentPassword}
                showStrengthMeter={false}
                showCriteria={false}
              />
              <p className="mt-1 text-sm text-gray-500">
                Required to change email or password
              </p>
            </div>

            <div>
              <Label htmlFor="new-password">New Password</Label>
              <PasswordInput
                id="new-password"
                name="new-password"
                label=""
                value={newPassword}
                onChange={setNewPassword}
                showStrengthMeter
                showCriteria
              />
              <p className="mt-1 text-sm text-gray-500">
                Leave blank if you don't want to change
              </p>
            </div>
          </div>

          <div className="flex justify-end">
            <Button
              type="submit"
              className="bg-emerald-600 hover:bg-emerald-700"
              disabled={isLoading || (newPassword !== "" && !isNewPasswordValid)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Saving changes...
                </>
              ) : (
                "Save changes"
              )}
            </Button>
          </div>
        </form>

        <div className="border-t border-gray-200 pt-6">
          <h3 className="text-lg font-medium text-gray-900">Delete Account</h3>
          <p className="mt-1 text-sm text-gray-600">
            Once you delete your account, there is no going back. Please be certain.
          </p>
          <div className="mt-4">
            <Button
              type="button"
              variant="destructive"
              onClick={() => {
                toast.error("Account deletion is not implemented yet")
              }}
            >
              Delete Account
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}