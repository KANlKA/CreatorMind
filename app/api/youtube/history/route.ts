import User from "@/models/User"
import { auth } from "@/app/api/auth/[...nextauth]/route"
import { NextResponse } from "next/server"

export async function GET() {
  const session = await auth()

  if (!session?.user?.email) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  const user = await User.findOne({ email: session.user.email })

  if (!user) {
    return NextResponse.json({ error: "User not found" }, { status: 404 })
  }

  return NextResponse.json({
    lastSyncedAt: user.lastSyncedAt,
    syncStatus: user.syncStatus,
  })
}
