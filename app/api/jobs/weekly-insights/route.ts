import { NextResponse } from "next/server"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import connectDB from "@/lib/db/mongodb"
import User from "@/models/User"
import { weeklyInsightsQueue } from "@/lib/jobs/queue"

export async function POST() {
  const session = await auth()
  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  await connectDB()

  const user = await User.findOne({ email: session.user.email })
  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  await weeklyInsightsQueue.add(
    "weekly-insights-manual",
    { userId: user._id.toString(), forceSend: true },
    { removeOnComplete: true, removeOnFail: true }
  )

  return NextResponse.json({ success: true })
}
