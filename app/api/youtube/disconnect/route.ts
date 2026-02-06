import { auth } from "@/app/api/auth/[...nextauth]/route"
import User from "@/models/User"
import { NextResponse } from "next/server"

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) return NextResponse.json({}, { status: 401 })

  await User.updateOne(
    { email: session.user.email },
    {
      $unset: {
        youtubeChannelId: "",
        youtubeAccessToken: "",
        youtubeRefreshToken: "",
      },
    }
  )

  return NextResponse.json({ success: true })
}
