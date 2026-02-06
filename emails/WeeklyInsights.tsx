import * as React from "react";

type Idea = {
  title: string;
  notes?: string;
  tags?: string[];
};

export default function WeeklyInsightsEmail({
  userName,
  ideas,
  generatedAt,
  unsubscribeUrl,
}: {
  userName: string;
  ideas: Idea[];
  generatedAt: string;
  unsubscribeUrl?: string;
}) {
  return (
    <html>
      <body
        style={{
          fontFamily:
            'Inter, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
        }}
      >
        <div style={{ maxWidth: 680, margin: "0 auto", padding: 24 }}>
          <h2 style={{ color: "#111827" }}>Hi {userName},</h2>
          <p style={{ color: "#374151" }}>
            Here are your top video ideas for the week ({generatedAt}):
          </p>

          <div style={{ marginTop: 16 }}>
            {ideas.map((idea, idx) => (
              <div
                key={idx}
                style={{
                  padding: 12,
                  borderRadius: 8,
                  background: "#fff",
                  marginBottom: 12,
                  boxShadow: "0 1px 2px rgba(0,0,0,0.04)",
                }}
              >
                <h3 style={{ margin: 0, color: "#0f172a" }}>
                  {idx + 1}. {idea.title}
                </h3>
                {idea.notes && (
                  <p style={{ margin: "8px 0", color: "#374151" }}>
                    {idea.notes}
                  </p>
                )}
                {idea.tags && (
                  <p style={{ margin: 0, color: "#6b7280" }}>
                    {idea.tags.join(" • ")}
                  </p>
                )}
              </div>
            ))}
          </div>

          <div style={{ marginTop: 20, color: "#6b7280" }}>
            <p style={{ margin: 0 }}>Action items:</p>
            <ul>
              <li>Pick one idea and script it this week.</li>
              <li>
                Test two thumbnail variations using your top-performing format.
              </li>
              <li>Schedule recording and batch production if possible.</li>
            </ul>
          </div>

          <footer style={{ marginTop: 28, color: "#9ca3af", fontSize: 13 }}>
            <p>
              Sent by CreatorMind • <a href="/settings">Manage preferences</a>
            </p>
            {unsubscribeUrl && (
              <p>
                <a href={unsubscribeUrl} style={{ color: "#9ca3af" }}>
                  One-click unsubscribe
                </a>
              </p>
            )}
          </footer>
        </div>
      </body>
    </html>
  );
}
