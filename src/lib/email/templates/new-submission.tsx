import {
  Body,
  Button,
  Container,
  Head,
  Heading,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from "@react-email/components";
import * as React from "react";

interface NewSubmissionEmailProps {
  type: "feedback" | "report";
  category?: string;
  contentPreview?: string;
  isUrgent?: boolean;
  appUrl: string;
}

export function NewSubmissionEmail({
  type,
  category,
  contentPreview,
  isUrgent = false,
  appUrl,
}: NewSubmissionEmailProps) {
  const isReport = type === "report";
  const typeName = isReport ? "신고" : "피드백";
  const subjectLabel = isUrgent ? `[긴급] 새로운 ${typeName}` : `새로운 ${typeName}`;

  return (
    <Html>
      <Head />
      <Preview>{subjectLabel}이 EUBS 소리함에 접수되었습니다.</Preview>
      <Body style={main}>
        <Container style={container}>
          {/* Header */}
          <Section style={header}>
            <Text style={logoText}>EUBS</Text>
            <Text style={logoSubtext}>Ewha University Broadcasting System</Text>
          </Section>

          {/* Badge */}
          <Section style={badgeSection}>
            {isUrgent && (
              <span style={urgentBadge}>긴급</span>
            )}
            <span style={isReport ? reportBadge : feedbackBadge}>{typeName}</span>
            {category && <span style={categoryBadge}>{category}</span>}
          </Section>

          {/* Title */}
          <Heading style={h1}>
            {subjectLabel}이 접수되었습니다
          </Heading>

          {/* Content preview — feedback only */}
          {!isReport && contentPreview && (
            <Section style={contentBox}>
              <Text style={contentText}>{contentPreview}</Text>
            </Section>
          )}

          {/* Report — hide content for privacy */}
          {isReport && (
            <Section style={contentBox}>
              <Text style={contentText}>
                새로운 신고가 접수되었습니다.{"\n"}
                신고 내용은 관리자 페이지에서 확인해주세요.
              </Text>
            </Section>
          )}

          <Hr style={hr} />

          <Button style={button} href={`${appUrl}/admin`}>
            관리자 페이지에서 확인하기
          </Button>

          <Hr style={hr} />

          <Text style={footer}>
            이 이메일은 EUBS 익명 소리함에서 자동으로 발송되었습니다.{"\n"}
            답장하지 마세요.
          </Text>
        </Container>
      </Body>
    </Html>
  );
}

// Styles
const main = {
  backgroundColor: "#f0f9f4",
  fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};

const container = {
  margin: "0 auto",
  padding: "40px 20px",
  maxWidth: "560px",
};

const header = {
  backgroundColor: "#1b5e3b",
  borderRadius: "12px 12px 0 0",
  padding: "28px 32px",
  textAlign: "center" as const,
};

const logoText = {
  color: "#ffffff",
  fontSize: "28px",
  fontWeight: "700",
  letterSpacing: "-0.02em",
  margin: "0",
};

const logoSubtext = {
  color: "rgba(255,255,255,0.7)",
  fontSize: "12px",
  margin: "4px 0 0",
};

const badgeSection = {
  backgroundColor: "#ffffff",
  padding: "16px 32px 0",
};

const feedbackBadge = {
  backgroundColor: "#dcf0e5",
  color: "#1b5e3b",
  borderRadius: "100px",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "600",
  marginRight: "8px",
};

const reportBadge = {
  backgroundColor: "#fee2e2",
  color: "#b91c1c",
  borderRadius: "100px",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "600",
  marginRight: "8px",
};

const urgentBadge = {
  backgroundColor: "#fef08a",
  color: "#78350f",
  borderRadius: "100px",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "700",
  marginRight: "8px",
};

const categoryBadge = {
  backgroundColor: "#f1f5f9",
  color: "#64748b",
  borderRadius: "100px",
  padding: "4px 12px",
  fontSize: "12px",
};

const h1 = {
  backgroundColor: "#ffffff",
  padding: "16px 32px 0",
  color: "#111827",
  fontSize: "20px",
  fontWeight: "700",
  lineHeight: "1.4",
  margin: "0",
};

const contentBox = {
  backgroundColor: "#ffffff",
  padding: "16px 32px 24px",
};

const contentText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap" as const,
  borderLeft: "3px solid #1b5e3b",
  paddingLeft: "16px",
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "0",
};

const button = {
  backgroundColor: "#1b5e3b",
  borderRadius: "8px",
  color: "#ffffff",
  display: "block",
  fontSize: "15px",
  fontWeight: "600",
  textAlign: "center" as const,
  padding: "14px 24px",
  margin: "24px 32px",
  textDecoration: "none",
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.6",
  textAlign: "center" as const,
  padding: "16px 32px",
  whiteSpace: "pre-wrap" as const,
};
