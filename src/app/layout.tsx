import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "EUBS 익명 소리함",
  description: "이화여자대학교 방송국 EUBS 익명 피드백 & 기획안 피드백 시스템",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko">
      <body className="bg-gray-50 text-gray-900 antialiased">
        {children}
      </body>
    </html>
  );
}
