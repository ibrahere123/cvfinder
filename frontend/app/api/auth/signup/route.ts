import { NextResponse } from "next/server"

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const { email, password, companyName } = body

    // TODO: Add your user creation logic here
    // For now, we'll simulate a successful registration
    if (email && password && companyName) {
      return NextResponse.json(
        {
          success: true,
          user: {
            email,
            companyName,
            name: "Demo User",
          },
        },
        { status: 201 }
      )
    }

    return NextResponse.json(
      { success: false, error: "Missing required fields" },
      { status: 400 }
    )
  } catch (error) {
    return NextResponse.json(
      { success: false, error: "Internal server error" },
      { status: 500 }
    )
  }
}