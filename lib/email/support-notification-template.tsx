export function SupportNotificationEmail({
  userName,
  userEmail,
  subject,
  message,
}: {
  userName: string;
  userEmail: string;
  subject: string;
  message: string;
}) {
  return (
    <div style={containerStyle}>
      <div style={headerStyle}>
        <h2 style={titleStyle}>
          Query Requires Manual Review
        </h2>
        <p style={subtitleStyle}>
          This is a support notification for a query that requires team attention.
        </p>
      </div>

      <div style={contentStyle}>
        <h3 style={sectionTitleStyle}>Query Details:</h3>
        <div style={detailsBoxStyle}>
          <p style={detailStyle}>
            <strong>From:</strong> {userName} ({userEmail})
          </p>
          <p style={detailStyle}>
            <strong>Subject:</strong> {subject}
          </p>
          <p style={{ ...detailStyle, whiteSpace: "pre-wrap" }}>
            <strong>Message:</strong>
            <br />
            {message}
          </p>
        </div>
      </div>

      <div style={warningStyle}>
        <p style={warningTextStyle}>
          This query has been forwarded to the support team for manual response. Please reach out to the user promptly.
        </p>
      </div>
    </div>
  );
}

// Inline styles
const containerStyle = {
  fontFamily: '"Arial", sans-serif',
  maxWidth: "600px",
  margin: "0 auto",
  padding: "0",
};

const headerStyle = {
  backgroundColor: "#f3f4f6",
  padding: "20px",
  borderRadius: "8px 8px 0 0",
  marginBottom: "0",
  borderBottom: "2px solid #dc2626",
};

const titleStyle = {
  color: "#dc2626",
  margin: "0 0 10px 0",
  fontSize: "18px",
  fontWeight: "600" as const,
};

const subtitleStyle = {
  margin: "0",
  color: "#374151",
  fontSize: "14px",
  lineHeight: "1.5",
};

const contentStyle = {
  padding: "20px",
  backgroundColor: "#ffffff",
};

const sectionTitleStyle = {
  color: "#111827",
  marginBottom: "12px",
  fontSize: "16px",
  fontWeight: "600" as const,
};

const detailsBoxStyle = {
  backgroundColor: "#f9fafb",
  padding: "12px",
  borderLeft: "4px solid #6366f1",
  marginBottom: "12px",
  borderRadius: "4px",
};

const detailStyle = {
  margin: "0 0 8px 0",
  fontSize: "14px",
  color: "#1f2937",
  lineHeight: "1.5",
};

const warningStyle = {
  backgroundColor: "#fef3c7",
  padding: "12px",
  borderRadius: "0 0 8px 8px",
  marginTop: "0",
  borderTop: "2px solid #fcd34d",
};

const warningTextStyle = {
  margin: "0",
  fontSize: "13px",
  color: "#92400e",
  lineHeight: "1.5",
};