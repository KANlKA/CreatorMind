import Mailjet from "node-mailjet";

const mailjet = Mailjet.apiConnect(
  process.env.MAILJET_API_KEY!,
  process.env.MAILJET_SECRET_KEY!
);

export async function sendEmailViaMailjet({
  to,
  subject,
  htmlContent,
  unsubscribeUrl,
}: {
  to: string;
  subject: string;
  htmlContent: string;
  unsubscribeUrl?: string;
}) {
  try {
    const response = await mailjet.post("send", { version: "v3.1" }).request({
      Messages: [
        {
          From: {
            Email: process.env.MAILJET_SENDER_EMAIL || "kpzenha49@gmail.com",
            Name: "CreatorMind",
          },
          To: [
            {
              Email: to,
            },
          ],
          Subject: subject,
          HTMLPart: htmlContent,
          CustomID: `weekly-insights-${Date.now()}`,
          Headers: unsubscribeUrl
            ? {
                "List-Unsubscribe": `<${unsubscribeUrl}>`,
              }
            : undefined,
        },
      ],
    } as any);

    const body = response.body as any;
    return {
      success: true,
      messageId: body?.Messages?.[0]?.ID,
      messageStatus: body?.Messages?.[0]?.Status,
    };
  } catch (error) {
    console.error("Error sending email via Mailjet:", error);
    throw error;
  }
}

export async function getEmailDeliveryHistory(
  senderEmail: string,
  limit: number = 50,
  offset: number = 0
) {
  try {
    const response = await mailjet
      .get("messagesendevent", { version: "v3" })
      .request({
        Limit: limit,
        Offset: offset,
        Filter: senderEmail ? { FromEmail: senderEmail } : {},
      } as any);

    const body = response.body as any;
    return {
      success: true,
      messages: body?.Data || [],
      count: body?.Count || 0,
      total: body?.Total || 0,
    };
  } catch (error) {
    console.error("Error fetching email delivery history:", error);
    throw error;
  }
}

export async function getMessageInfo(messageId: number) {
  try {
    const response = await mailjet
      .get("messageinformation", { version: "v3" })
      .id(messageId)
      .request();

    const body = response.body as any;
    return {
      success: true,
      message: body?.Data?.[0] || null,
    };
  } catch (error) {
    console.error("Error fetching message info:", error);
    throw error;
  }
}