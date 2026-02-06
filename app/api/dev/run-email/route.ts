import { runEmailScheduler } from "@/lib/email/scheduler"
import { NextResponse } from "next/server"

export async function GET() {
  await runEmailScheduler()
  return NextResponse.json({ success: true })
}
