import { render } from "@react-email/render";
import { sendEmailViaMailjet } from "@/lib/email/mailjet";
import { WeeklyInsightsEmail } from "@/lib/email/weekly-insights-template";

interface SendWeeklyEmailParams {
  user: any;
  ideasDoc: any;
  ideas: any[];
}

export async function sendWeeklyEmail({
  user,
  ideasDoc,
  ideas,
}: SendWeeklyEmailParams) {
  try {
    if (!user || !ideas || ideas.length === 0) {
      return {
        success: false,
        error: "Missing required parameters",
      };
    }

    // Generate email HTML from template
    const emailHtml = await render(
      WeeklyInsightsEmail({
        userName: user.name || user.email?.split("@")[0] || "Creator",
        ideas: ideas,
        timezone: user.settings?.timezone || "UTC",
      })
    );

    // Send email via Mailjet
    const result = await sendEmailViaMailjet({
      to: user.email,
      subject: `Your Weekly Video Ideas - ${new Date().toLocaleDateString()}`,
      htmlContent: emailHtml,
    });

    console.log(`✅ Email sent successfully to ${user.email}`);

    // Update email status in the document if it has an _id
    if (ideasDoc && ideasDoc._id) {
      try {
        const GeneratedIdea = (await import("@/models/GeneratedIdea")).default;
        await GeneratedIdea.updateOne(
          { _id: ideasDoc._id },
          {
            emailStatus: "sent",
            emailSentAt: new Date(),
          }
        );
        console.log(`Updated emailStatus for GeneratedIdea ${ideasDoc._id}`);
      } catch (updateError) {
        console.log("Could not update emailStatus (not critical):", updateError);
      }
    }

    return {
      success: true,
      messageId: result.messageId,
      messageStatus: result.messageStatus || "sent",
    };
  } catch (error) {
    console.error("Error in sendWeeklyEmail:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
