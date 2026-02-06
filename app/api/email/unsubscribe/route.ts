import { NextResponse } from "next/server"
import connectDB from "@/lib/db/mongodb"
import User from "@/models/User"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const uid = searchParams.get("uid")
  const token = searchParams.get("token")
  const legacyUserId = searchParams.get("user")

  if (uid && token) {
    const redirectUrl = new URL("/api/unsubscribe", req.url)
    redirectUrl.searchParams.set("uid", uid)
    redirectUrl.searchParams.set("token", token)
    return NextResponse.redirect(redirectUrl)
  }

  if (!legacyUserId) {
    return NextResponse.json({}, { status: 400 })
  }

  await connectDB()

  await User.updateOne(
    { _id: legacyUserId },
    { $set: { "settings.emailEnabled": false } }
  )

  return NextResponse.json({
    message: "You have been unsubscribed successfully.",
  })
}
