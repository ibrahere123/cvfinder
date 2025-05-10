import { NextResponse } from "next/server"
import { sendPasswordResetEmail } from "firebase/auth"
import { auth } from "@/lib/firebase"

export async function POST(req: Request) {
  try {
    const { email } = await req.json()

    if (!email) {
      return NextResponse.json(
        { success: false, error: "Email is required" },
        { status: 400 }
      )
    }

    await sendPasswordResetEmail(auth, email)

    return NextResponse.json(
      { success: true, message: "Password reset email sent" },
      { status: 200 }
    )
  } catch (error: any) {
    return NextResponse.json(
      { success: false, error: error.message || "Failed to send password reset email" },
      { status: 500 }
    )
  }
}