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
} from "@react-email/components"

export function WeeklyInsightsEmail({
  userName,
  ideas,
  insights,
  patterns,
  actions,
  unsubscribeUrl,
}: {
  userName: string
  ideas: any[]
  insights: string[]
  patterns: string[]
  actions: string[]
  unsubscribeUrl: string
}) {
  return (
    <Html>
      <Head />
      <Preview>Your weekly creator intelligence</Preview>
      <Body style={{ backgroundColor: "#f8fafc", margin: 0, padding: 0 }}>
        <Container style={container}>
          <Section style={card}>
            <Heading style={title}>Weekly Creator Intelligence</Heading>
            <Text style={subtitle}>Hi {userName}, here is your weekly report.</Text>
          </Section>

          <Section style={card}>
            <Heading as="h3" style={sectionTitle}>Top Video Ideas</Heading>
            {ideas.map((idea, idx) => {
              const confidence =
                typeof idea.confidence === "number"
                  ? idea.confidence <= 1
                    ? Math.round(idea.confidence * 100)
                    : Math.round(idea.confidence)
                  : null
              const predictedEngagement =
                typeof idea.predictedEngagement === "number"
                  ? idea.predictedEngagement <= 1
                    ? Math.round(idea.predictedEngagement * 100)
                    : Math.round(idea.predictedEngagement)
                  : null

              return (
              <Section key={idx} style={ideaCard}>
                <Text style={ideaTitle}>
                  {idx + 1}. {idea.title}
                  {confidence !== null ? ` (${confidence}% confidence)` : ""}
                </Text>
                <Text style={ideaMeta}>
                  Predicted engagement: {predictedEngagement ?? "N/A"}%
                </Text>
                {idea.suggestedStructure && (
                  <Text style={ideaMeta}>
                    Hook: {idea.suggestedStructure.hook || "N/A"} | Format:{" "}
                    {idea.suggestedStructure.format || "N/A"} | Tone:{" "}
                    {idea.suggestedStructure.tone || "N/A"} | Length:{" "}
                    {idea.suggestedStructure.length || "N/A"}
                  </Text>
                )}
                {idea.reasoning && (
                  <Text style={ideaReason}>
                    Why it works: {idea.reasoning.audienceFit || idea.reasoning.commentDemand || "N/A"}
                  </Text>
                )}
              </Section>
              )
            })}
          </Section>

          <Section style={card}>
            <Heading as="h3" style={sectionTitle}>Key Insights</Heading>
            {insights.length === 0 && (
              <Text style={muted}>No insights available this week.</Text>
            )}
            {insights.map((i, idx) => (
              <Text key={idx} style={listItem}>- {i}</Text>
            ))}
          </Section>

          <Section style={card}>
            <Heading as="h3" style={sectionTitle}>Performance Patterns</Heading>
            {patterns.length === 0 && (
              <Text style={muted}>No clear patterns detected yet.</Text>
            )}
            {patterns.map((p, idx) => (
              <Text key={idx} style={listItem}>- {p}</Text>
            ))}
          </Section>

          <Section style={card}>
            <Heading as="h3" style={sectionTitle}>Action Items</Heading>
            {actions.map((a, idx) => (
              <Text key={idx} style={listItem}>- {a}</Text>
            ))}
          </Section>

          <Hr style={divider} />
          <Section style={card}>
            <Text style={footerText}>
              You received this email because weekly insights are enabled in your
              settings.
            </Text>
            <Button href={unsubscribeUrl} style={unsubscribeButton}>
              Unsubscribe
            </Button>
          </Section>
        </Container>
      </Body>
    </Html>
  )
}

const container = {
  padding: "24px",
}

const card = {
  backgroundColor: "#ffffff",
  borderRadius: "12px",
  padding: "20px",
  marginBottom: "16px",
  border: "1px solid #e5e7eb",
}

const title = {
  fontSize: "22px",
  margin: "0 0 6px 0",
}

const subtitle = {
  margin: 0,
  color: "#4b5563",
}

const sectionTitle = {
  fontSize: "16px",
  margin: "0 0 12px 0",
}

const ideaCard = {
  backgroundColor: "#f9fafb",
  borderRadius: "10px",
  padding: "12px",
  marginBottom: "10px",
}

const ideaTitle = {
  margin: "0 0 6px 0",
  fontWeight: "bold",
}

const ideaMeta = {
  margin: "0 0 6px 0",
  color: "#6b7280",
  fontSize: "12px",
}

const ideaReason = {
  margin: 0,
  color: "#374151",
  fontSize: "13px",
}

const listItem = {
  margin: "0 0 6px 0",
}

const muted = {
  color: "#6b7280",
  margin: 0,
}

const divider = {
  borderColor: "#e5e7eb",
  margin: "12px 0",
}

const footerText = {
  margin: "0 0 12px 0",
  color: "#6b7280",
  fontSize: "12px",
}

const unsubscribeButton = {
  backgroundColor: "#111827",
  color: "#ffffff",
  padding: "10px 16px",
  borderRadius: "8px",
  textDecoration: "none",
}
