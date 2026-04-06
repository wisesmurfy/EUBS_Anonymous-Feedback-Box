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

interface ProposalFeedbackReadyEmailProps {
  submitterName: string;
  proposalTitle: string;
  viewToken: string;
  appUrl: string;
}

export function ProposalFeedbackReadyEmail({
  submitterName,
  proposalTitle,
  viewToken,
  appUrl,
}: ProposalFeedbackReadyEmailProps) {
  const feedbackUrl = `${appUrl}/proposals/${viewToken}`;

  return (
    <Html>
      <Head />
      <Preview>기획안 피드백이 완료되었습니다: {proposalTitle}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Section style={header}>
            <Text style={logoText}>EUBS</Text>
            <Text style={logoSubtext}>Ewha University Broadcasting System</Text>
          </Section>

          <Section style={body}>
            <Heading style={h1}>기획안 피드백이 도착했어요</Heading>
            <Text style={greeting}>{submitterName}님,</Text>
            <Text style={paragraph}>
              제출하신 기획안 <strong>"{proposalTitle}"</strong>에 대한 국부국 피드백이 완료되었습니다.
              아래 버튼을 눌러 피드백을 확인해보세요.
            </Text>

            <Button style={button} href={feedbackUrl}>
              피드백 확인하기
            </Button>

            <Hr style={hr} />

            <Text style={note}>
              이 링크는 본인만 접근 가능한 고유 링크입니다.{"\n"}
              링크를 다른 사람과 공유하지 마세요.
            </Text>

            <Text style={footer}>
              이 이메일은 EUBS 기획안 피드백 시스템에서 자동으로 발송되었습니다.
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
  fontSize: "22px",
  fontWeight: "700",
  margin: "0 0 16px",
  lineHeight: "1.4",
};

const greeting = {
  color: "#374151",
  fontSize: "16px",
  fontWeight: "600",
  margin: "0 0 8px",
};

const paragraph = {
  color: "#374151",
  fontSize: "15px",
  lineHeight: "1.7",
  margin: "0 0 24px",
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
  textDecoration: "none",
};

const hr = {
  borderColor: "#e5e7eb",
  margin: "24px 0",
};

const note = {
  color: "#6b7280",
  fontSize: "13px",
  lineHeight: "1.6",
  backgroundColor: "#f9fafb",
  padding: "12px 16px",
  borderRadius: "8px",
  whiteSpace: "pre-wrap" as const,
};

const footer = {
  color: "#9ca3af",
  fontSize: "12px",
  lineHeight: "1.6",
  marginTop: "16px",
};
