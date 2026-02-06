import { NextRequest, NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import User from "@/models/User"
import crypto from "crypto"

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const uid = searchParams.get("uid")
    const token = searchParams.get("token")

    if (!uid || !token) {
      return NextResponse.json({ error: "Missing parameters" }, { status: 400 })
    }

    const secret = process.env.UNSUBSCRIBE_SECRET || "default_unsub_secret"
    const expected = crypto
      .createHmac("sha256", secret)
      .update(uid)
      .digest("hex")

    if (token !== expected) {
      return NextResponse.json({ error: "Invalid token" }, { status: 401 })
    }

    await connectDB()

    const user = await User.findById(uid)
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 })
    }

    // ✅ Correct unsubscribe behavior
    user.settings.emailEnabled = false
    await user.save()

    const appUrl = process.env.NEXT_PUBLIC_APP_URL || ""
    const html = `
      <html>
        <head><title>Unsubscribed</title></head>
        <body style="font-family: system-ui, sans-serif; padding:24px;">
          <h1>You're unsubscribed</h1>
          <p>
            We've stopped sending you weekly emails.
            You can re-enable them anytime from your
            <a href="${appUrl}/settings">settings</a>.
          </p>
        </body>
      </html>
    `

    return new NextResponse(html, {
      status: 200,
      headers: { "Content-Type": "text/html" },
    })
  } catch (error) {
    console.error("Error processing unsubscribe:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 },
    )
  }
}
