import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Heading,
  Text,
  Section,
  Hr,
  Button,
  Link,
} from "@react-email/components";

export function ContactResponseEmail({
  userName,
  queryType,
  subject,
  response,
}: {
  userName: string;
  queryType: "ai_response" | "forwarded_to_support";
  subject: string;
  response?: string;
}) {
  if (queryType === "forwarded_to_support") {
    return (
      <Html>
        <Head />
        <Preview>Your inquiry has been forwarded to our support team</Preview>
        <Body style={{ backgroundColor: "#f8fafc", margin: 0, padding: 0 }}>
          <Container style={container}>
            <Section style={headerSection}>
              <Heading style={mainTitle}>Thank You for Reaching Out</Heading>
              <Text style={subtitle}>
                Your inquiry has been received
              </Text>
            </Section>

            <Section style={contentSection}>
              <Text style={greeting}>Hello {userName},</Text>

              <Text style={bodyText}>
                Thank you for contacting CreatorMind support regarding:
              </Text>

              <Section style={highlightBox}>
                <Text style={highlightText}>{subject}</Text>
              </Section>

              <Text style={bodyText}>
                We've reviewed your inquiry and determined that it requires
                personalized attention from our support team. Your message has
                been forwarded to our team members who specialize in this area.
              </Text>

              <Text style={bodyText}>
                You can expect a detailed response within 24 hours. Our team will
                address all your questions and provide you with the best solution
                for your needs.
              </Text>

              <Text style={bodyText}>
                In the meantime, feel free to explore our documentation or reach
                out again if you have additional questions.
              </Text>

              <Section style={ctaSection}>
                <Button
                  href={`${process.env.NEXT_PUBLIC_APP_URL}`}
                  style={ctaButton}
                >
                  Visit CreatorMind
                </Button>
              </Section>
            </Section>

            <Hr style={divider} />

            <Section style={footerSection}>
              <Text style={footerText}>
                Best regards,<br />
                <strong>CreatorMind Support Team</strong>
              </Text>
              <Text style={footerText}>
                <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={footerLink}>
                  CreatorMind
                </Link>
                {" • "}© 2025 CreatorMind. All rights reserved.
              </Text>
            </Section>
          </Container>
        </Body>
      </Html>
    );
  }

  // AI Response template
  return (
    <Html>
      <Head />
      <Preview>Your question has been answered</Preview>
      <Body style={{ backgroundColor: "#f8fafc", margin: 0, padding: 0 }}>
        <Container style={container}>
          <Section style={headerSection}>
            <Heading style={mainTitle}>Here's the Information You Requested</Heading>
            <Text style={subtitle}>Response to: {subject}</Text>
          </Section>

          <Section style={contentSection}>
            <Text style={greeting}>Hello {userName},</Text>

            <Text style={bodyText}>
              Thank you for your question. Here's a detailed response:
            </Text>

            <Section style={responseBox}>
              <Text style={responseText}>
                {response || "Thank you for contacting CreatorMind support."}
              </Text>
            </Section>

            <Text style={bodyText}>
              If you have any follow-up questions or need further clarification,
              don't hesitate to reach out. We're here to help!
            </Text>

            <Section style={ctaSection}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL}`}
                style={ctaButton}
              >
                Visit CreatorMind
              </Button>
            </Section>

            <Section style={noteBox}>
              <Text style={noteText}>
                You can explore our documentation to learn more about CreatorMind features.
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          <Section style={footerSection}>
            <Text style={footerText}>
              Best regards,<br />
              <strong>CreatorMind Support</strong>
            </Text>
            <Text style={footerText}>
              <Link href={`${process.env.NEXT_PUBLIC_APP_URL}`} style={footerLink}>
                CreatorMind
              </Link>
              {" • "}© 2025 CreatorMind. All rights reserved.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const container = {
  maxWidth: "600px",
  margin: "0 auto",
  padding: "20px",
  fontFamily:
    'Inter, -apple-system, "Segoe UI", "Helvetica Neue", sans-serif',
};

const headerSection = {
  backgroundColor: "#ffffff",
  borderRadius: "12px 12px 0 0",
  padding: "32px 24px",
  borderBottom: "3px solid #6366f1",
};

const mainTitle = {
  margin: "0 0 8px 0",
  fontSize: "28px",
  fontWeight: "700",
  color: "#0f172a",
  lineHeight: "1.2",
};

const subtitle = {
  margin: "0",
  fontSize: "16px",
  color: "#475569",
  lineHeight: "1.5",
};

const contentSection = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 12px 12px",
  padding: "32px 24px",
  borderTop: "1px solid #e2e8f0",
};

const greeting = {
  margin: "0 0 16px 0",
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
};

const bodyText = {
  margin: "0 0 16px 0",
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
};

const highlightBox = {
  backgroundColor: "#f1f5f9",
  borderLeft: "4px solid #6366f1",
  padding: "16px",
  borderRadius: "8px",
  marginBottom: "16px",
};

const highlightText = {
  margin: "0",
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
};

const responseBox = {
  backgroundColor: "#f8fafc",
  borderRadius: "8px",
  padding: "20px",
  marginBottom: "20px",
  border: "1px solid #e2e8f0",
};

const responseText = {
  margin: "0",
  fontSize: "14px",
  color: "#334155",
  lineHeight: "1.8",
  whiteSpace: "pre-wrap" as const,
};

const ctaSection = {
  textAlign: "center" as const,
  margin: "24px 0",
};

const ctaButton = {
  backgroundColor: "#6366f1",
  color: "#ffffff",
  padding: "12px 32px",
  borderRadius: "8px",
  textDecoration: "none",
  fontSize: "14px",
  fontWeight: "600",
  display: "inline-block",
};

const tipsBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "20px",
  border: "1px solid #fcd34d",
};

const tipsTitle = {
  margin: "0 0 12px 0",
  fontSize: "14px",
  fontWeight: "600",
  color: "#92400e",
};

const tipsList = {
  margin: "0",
  paddingLeft: "20px",
};

const tipsItem = {
  margin: "0 0 8px 0",
  fontSize: "13px",
  color: "#b45309",
};

const tipsLink = {
  color: "#b45309",
  textDecoration: "underline",
};

const noteBox = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "20px",
  border: "1px solid #fcd34d",
};

const noteText = {
  margin: "0",
  fontSize: "13px",
  color: "#92400e",
  lineHeight: "1.6",
};

const divider = {
  borderColor: "#e2e8f0",
  borderTop: "1px solid #e2e8f0",
  margin: "20px 0",
};

const footerSection = {
  textAlign: "center" as const,
  padding: "20px 24px",
};

const footerText = {
  margin: "0 0 8px 0",
  fontSize: "12px",
  color: "#64748b",
  lineHeight: "1.5",
};

const footerLink = {
  color: "#6366f1",
  textDecoration: "underline",
};