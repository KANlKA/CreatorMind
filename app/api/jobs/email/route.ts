import { NextResponse } from "next/server"
import { runEmailScheduler } from "@/lib/email/scheduler"

export async function POST() {
  await runEmailScheduler()
  return NextResponse.json({ status: "Email job executed" })
}
