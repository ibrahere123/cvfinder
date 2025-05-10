import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password } = body

    // TODO: Add your authentication logic here
    // For now, we'll simulate a successful login
    if (email && password) {
      const response = NextResponse.json(
        { 
          success: true,
          user: {
            email,
            name: "Demo User",
          }
        },
        { status: 200 }
      )
      // Set a dummy auth-token cookie valid for 1 day
      response.cookies.set({
        name: "auth-token",
        value: "dummy-token",
        httpOnly: true,
        path: "/",
        maxAge: 60 * 60 * 24,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      })
      return response
    }

    return NextResponse.json(
      { success: false, error: "Invalid credentials" },
      { status: 401 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}

