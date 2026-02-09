import {
  Html,
  Head,
  Preview,
  Body,
  Container,
  Section,
  Heading,
  Text,
  Button,
  Hr,
  Link,
} from "@react-email/components";

export function WeeklyInsightsEmail({
  userName,
  ideas,
  timezone,
}: {
  userName: string;
  ideas: any[];
  timezone: string;
}) {
  return (
    <Html>
      <Head />
      <Preview>{`Your ${ideas.length} weekly video ideas`}</Preview>
      <Body style={{ backgroundColor: "#f8fafc", margin: 0, padding: 0 }}>
        <Container style={container}>
          {/* Header */}
          <Section style={headerSection}>
            <Heading style={mainTitle}>
              Your {ideas.length} Weekly Video Ideas
            </Heading>
            <Text style={subtitle}>
              Personalized for you • {new Date().toLocaleDateString()}
            </Text>
          </Section>

          {/* Content */}
          <Section style={contentSection}>
            <Text style={greeting}>Hello {userName},</Text>
            <Text style={bodyText}>
              Here are your top {ideas.length} video ideas based on your
              preferences and audience insights:
            </Text>

            {/* Ideas */}
            {ideas.map((idea, index) => (
              <div key={index} style={ideaContainer as any}>
                <Section style={ideaHeader}>
                  <div
                    style={{
                      display: "flex",
                      alignItems: "center",
                      gap: "12px",
                      marginBottom: "8px",
                    }}
                  >
                  </div>
                  <Text style={ideaTitle}>{idea.title}</Text>
                </Section>

                <Section style={ideaBody}>
                  {/* Confidence & Engagement */}
                  <div style={metricsContainer as any}>
                    <div style={metricBox}>
                      <Text style={metricLabel}>Confidence Score</Text>
                      <Text style={metricValue}>
                        {Math.round((idea.confidence || 0) * 100)}%
                      </Text>
                    </div>
                    <div style={metricBox}>
                      <Text style={metricLabel}>Predicted Engagement</Text>
                      <Text style={metricValue}>
                        {(
                          (idea.predictedEngagement || 0) * 100
                        ).toFixed(1)}%
                      </Text>
                    </div>
                  </div>

                  {/* Why It Will Work */}
                  {idea.reasoning && (
                    <div style={reasoningBox as any}>
                      <Text style={reasoningTitle}>Why This Will Work</Text>
                      {idea.reasoning.commentDemand && (
                        <div style={reasoningItem as any}>
                          <Text style={reasoningBullet}>•</Text>
                          <Text style={reasoningText}>
                            {idea.reasoning.commentDemand}
                          </Text>
                        </div>
                      )}
                      {idea.reasoning.pastPerformance && (
                        <div style={reasoningItem as any}>
                          <Text style={reasoningBullet}>•</Text>
                          <Text style={reasoningText}>
                            {idea.reasoning.pastPerformance}
                          </Text>
                        </div>
                      )}
                      {idea.reasoning.audienceFit && (
                        <div style={reasoningItem as any}>
                          <Text style={reasoningBullet}>•</Text>
                          <Text style={reasoningText}>
                            {idea.reasoning.audienceFit}
                          </Text>
                        </div>
                      )}
                    </div>
                  )}

                  {/* Suggested Structure */}
                  {idea.suggestedStructure && (
                    <div style={structureBox as any}>
                      <Text style={structureTitle}>
                        Suggested Structure
                      </Text>
                      <div style={structureGrid as any}>
                        {idea.suggestedStructure.format && (
                          <div style={structureItem as any}>
                            <Text style={structureLabel}>Format</Text>
                            <Text style={structureValue}>
                              {idea.suggestedStructure.format}
                            </Text>
                          </div>
                        )}
                        {idea.suggestedStructure.length && (
                          <div style={structureItem as any}>
                            <Text style={structureLabel}>Length</Text>
                            <Text style={structureValue}>
                              {idea.suggestedStructure.length}
                            </Text>
                          </div>
                        )}
                        {idea.suggestedStructure.tone && (
                          <div style={structureItem as any}>
                            <Text style={structureLabel}>Tone</Text>
                            <Text style={structureValue}>
                              {idea.suggestedStructure.tone}
                            </Text>
                          </div>
                        )}
                        {idea.suggestedStructure.hook && (
                          <div style={structureItem as any}>
                            <Text style={structureLabel}>Hook</Text>
                            <Text style={structureValue}>
                              {idea.suggestedStructure.hook}
                            </Text>
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </Section>
              </div>
            ))}

            <Hr style={divider} />

            {/* CTA */}
            <Section style={ctaSection}>
              <Button
                href={`${process.env.NEXT_PUBLIC_APP_URL}`}
                style={ctaButton}
              >
                Visit CreatorMind
              </Button>
            </Section>

            {/* Footer Note */}
            <Section style={noteSection}>
              <Text style={noteText}>
                <strong>Your Preferences Applied:</strong> These ideas are
                filtered based on your content preferences, focus areas, and
                preferred formats. You can update your settings anytime.
              </Text>
            </Section>
          </Section>

          <Hr style={divider} />

          {/* Footer */}
          <Section style={footerSection}>
            <Text style={footerText}>CreatorMind • {timezone} timezone</Text>
            <Text style={footerText}>
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/settings`}
                style={footerLink}
              >
                Manage Preferences
              </Link>
              {" • "}
              <Link
                href={`${process.env.NEXT_PUBLIC_APP_URL}/settings`}
                style={footerLink}
              >
                Unsubscribe
              </Link>
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
  fontFamily: 'Inter, -apple-system, "Segoe UI", sans-serif',
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
};

const subtitle = {
  margin: "0",
  fontSize: "14px",
  color: "#64748b",
};

const contentSection = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 12px 12px",
  padding: "32px 24px",
};

const greeting = {
  margin: "0 0 12px 0",
  fontSize: "16px",
  fontWeight: "600",
  color: "#0f172a",
};

const bodyText = {
  margin: "0 0 24px 0",
  fontSize: "14px",
  color: "#475569",
  lineHeight: "1.6",
};

const ideaContainer = {
  marginBottom: "24px",
  border: "1px solid #e2e8f0",
  borderRadius: "8px",
  overflow: "hidden",
};

const ideaHeader = {
  backgroundColor: "#f1f5f9",
  padding: "16px",
  borderBottom: "2px solid #e2e8f0",
};

const ideaRank = {
  margin: "0",
  fontSize: "14px",
  fontWeight: "600",
  color: "#6366f1",
};

const ideaTitle = {
  margin: "0",
  fontSize: "16px",
  fontWeight: "700",
  color: "#0f172a",
};

const ideaBody = {
  padding: "16px",
};

const metricsContainer = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "12px",
  marginBottom: "16px",
};

const metricBox = {
  padding: "12px",
  backgroundColor: "#f0f4ff",
  borderRadius: "6px",
  border: "1px solid #dbeafe",
};

const metricLabel = {
  margin: "0 0 4px 0",
  fontSize: "12px",
  color: "#475569",
  fontWeight: "500",
};

const metricValue = {
  margin: "0",
  fontSize: "18px",
  fontWeight: "700",
  color: "#6366f1",
};

const reasoningBox = {
  backgroundColor: "#f9fafb",
  borderRadius: "6px",
  padding: "12px",
  marginBottom: "16px",
  border: "1px solid #e5e7eb",
};

const reasoningTitle = {
  margin: "0 0 8px 0",
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
};

const reasoningItem = {
  display: "flex",
  gap: "8px",
  marginBottom: "8px",
};

const reasoningBullet = {
  margin: "0",
  fontSize: "12px",
  color: "#6366f1",
  fontWeight: "600",
  minWidth: "12px",
};

const reasoningText = {
  margin: "0",
  fontSize: "13px",
  color: "#334155",
  lineHeight: "1.5",
};

const structureBox = {
  backgroundColor: "#faf5ff",
  borderRadius: "6px",
  padding: "12px",
  marginTop: "16px",
  border: "1px solid #e9d5ff",
};

const structureTitle = {
  margin: "0 0 8px 0",
  fontSize: "14px",
  fontWeight: "600",
  color: "#0f172a",
};

const structureGrid = {
  display: "grid",
  gridTemplateColumns: "1fr 1fr",
  gap: "8px",
};

const structureItem = {
  padding: "8px",
  backgroundColor: "#f3e8ff",
  borderRadius: "4px",
};

const structureLabel = {
  margin: "0 0 2px 0",
  fontSize: "11px",
  color: "#6b21a8",
  fontWeight: "600",
};

const structureValue = {
  margin: "0",
  fontSize: "12px",
  color: "#581c87",
  fontWeight: "500",
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

const noteSection = {
  backgroundColor: "#fef3c7",
  borderRadius: "8px",
  padding: "16px",
  marginTop: "20px",
  border: "1px solid #fcd34d",
};

const noteText = {
  margin: "0",
  fontSize: "12px",
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
};

const footerLink = {
  color: "#6366f1",
  textDecoration: "underline",
};