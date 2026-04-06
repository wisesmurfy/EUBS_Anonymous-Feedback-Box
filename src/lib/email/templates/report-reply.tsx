import {
  Body,
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

interface ReportReplyEmailProps {
  replyContent: string;
}

export function ReportReplyEmail({ replyContent }: ReportReplyEmailProps) {
  return (
    <Html>
      <Head />
      <Preview>신고 접수 관련 안내드립니다</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>EUBS</Text>
            <Text style={logoSubtext}>Ewha University Broadcasting System</Text>
          </Section>

          <Section style={body}>
            <Heading style={h1}>신고 접수에 대한 답변</Heading>
            <Text style={paragraph}>
              접수하신 신고에 대해 아래와 같이 안내드립니다.
            </Text>

            <Section style={replyBox}>
              <Text style={replyText}>{replyContent}</Text>
            </Section>

            <Hr style={hr} />

            <Text style={footer}>
              — EUBS 국부국{"\n"}
              이 이메일은 EUBS 익명 소리함에서 발송되었습니다.
            </Text>
          </Section>
        </Container>
      </Body>
    </Html>
  );
}

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

const body = {
  backgroundColor: "#ffffff",
  borderRadius: "0 0 12px 12px",
  padding: "32px",
};

const h1 = {
  color: "#111827",
  fontSize: "20px",
  fontWeight: "700",
  margin: "0 0 16px",
};

const paragraph = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 20px",
};

const replyBox = {
  borderLeft: "3px solid #1b5e3b",
  paddingLeft: "16px",
  margin: "0 0 20px",
};

const replyText = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.7",
  whiteSpace: "pre-wrap" as const,
  margin: "0",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "20px 0",
};

const footer = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.6",
  whiteSpace: "pre-wrap" as const,
};
