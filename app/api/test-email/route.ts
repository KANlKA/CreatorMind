import Mailjet from "node-mailjet";
import { NextResponse } from "next/server";

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_SECRET_KEY!
);

export async function GET() {
  try {
    await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: "kpzenha49@gmail.com", // ✅ VERIFIED sender in Mailjet
            Name: "CreatorMind",
          },
          To: [
            {
              Email: "zenha4504@gmail.com", // can be teammate / friend
              Name: "Recipient",
            },
          ],
          Subject: "Mailjet test email 🚀",
          HTMLPart: "<p>Hello! This is a test email from <b>Mailjet</b>.</p>",
        },
      ],
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error(error);
    return NextResponse.json(
      { success: false, error: error.message },
      { status: 500 }
    );
  }
}
