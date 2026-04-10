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

interface NewQuestionEmailProps {
  questioner_name: string;
  questioner_role: string;
  content: string;
  appUrl: string;
}

export function NewQuestionEmail({
  questioner_name,
  questioner_role,
  content,
  appUrl,
}: NewQuestionEmailProps) {
  const preview = content.slice(0, 100) + (content.length > 100 ? "..." : "");

  return (
    <Html>
      <Head />
      <Preview>기획안 Q&A에 새 질문이 등록되었습니다: {preview}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>EUBS</Text>
            <Text style={logoSubtext}>Ewha University Broadcasting System</Text>
          </Section>

          <Section style={badgeSection}>
            <span style={badge}>기획안 Q&A</span>
          </Section>

          <Heading style={h1}>새 질문이 등록되었습니다</Heading>

          <Section style={metaBox}>
            <Text style={metaText}>
              <strong>{questioner_name}</strong> ({questioner_role})
            </Text>
          </Section>

          <Section style={contentBox}>
            <Text style={contentText}>{content}</Text>
          </Section>

          <Hr style={hr} />

          <Button style={button} href={`${appUrl}/admin/proposals/questions`}>
            관리자 페이지에서 답변하기
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

const main = {
  backgroundColor: "#f0f9f4",
  fontFamily: "'Pretendard', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
};
const container = { margin: "0 auto", padding: "40px 20px", maxWidth: "560px" };
const header = {
  backgroundColor: "#1b5e3b",
  borderRadius: "12px 12px 0 0",
  padding: "28px 32px",
  textAlign: "center" as const,
};
const logoText = { color: "#ffffff", fontSize: "28px", fontWeight: "700", letterSpacing: "-0.02em", margin: "0" };
const logoSubtext = { color: "rgba(255,255,255,0.7)", fontSize: "12px", margin: "4px 0 0" };
const badgeSection = { backgroundColor: "#ffffff", padding: "16px 32px 0" };
const badge = {
  backgroundColor: "#e0f2fe",
  color: "#0369a1",
  borderRadius: "100px",
  padding: "4px 12px",
  fontSize: "12px",
  fontWeight: "600",
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
const metaBox = { backgroundColor: "#ffffff", padding: "12px 32px 0" };
const metaText = { color: "#6b7280", fontSize: "13px", margin: "0" };
const contentBox = { backgroundColor: "#ffffff", padding: "12px 32px 24px" };
const contentText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap" as const,
  borderLeft: "3px solid #1b5e3b",
  paddingLeft: "16px",
  margin: "0",
};
const hr = { borderColor: "#e5e7eb", margin: "0" };
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
