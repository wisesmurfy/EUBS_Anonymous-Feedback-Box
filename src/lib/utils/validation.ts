import { z } from "zod";

export const submissionSchema = z.object({
  type: z.enum(["feedback", "report"]),
  category: z.string().optional(),
  content: z.string().min(10, "최소 10자 이상 입력해주세요.").max(2000, "최대 2000자까지 입력 가능합니다."),
  is_urgent: z.boolean().optional().default(false),
  answer_email: z.string().email("올바른 이메일 주소를 입력해주세요.").optional().or(z.literal("")),
}).refine((data) => {
  // 피드백은 이메일 없어야 함
  if (data.type === "feedback" && data.answer_email) return false;
  return true;
}, {
  message: "피드백에는 이메일을 입력할 수 없습니다.",
  path: ["answer_email"],
});

// 국부국이 어드민에서 기획안을 직접 등록할 때 사용
export const proposalSchema = z.object({
  title: z.string().min(2, "제목을 입력해주세요.").max(100, "제목은 100자 이내로 입력해주세요."),
  program_type: z.enum(["뉴스", "대담", "예능", "시사교양", "기타"]),
  submitter_name: z.string().min(1, "기획안 제출자 이름을 입력해주세요.").max(50),
  submitter_email: z.string().email("올바른 이메일 주소를 입력해주세요.").optional().or(z.literal("")),
  content: z.string().max(10000, "최대 10,000자까지 입력 가능합니다.").optional(),
  broadcast_date: z.string().optional(),
});

export const proposalFeedbackSchema = z.object({
  sections: z.array(z.object({
    title: z.string(),
    score: z.number().min(0).max(5),
    max_score: z.number().default(5),
    comment: z.string(),
  })),
  overall_comment: z.string().optional(),
});

export const adminNoteSchema = z.object({
  admin_note: z.string().max(2000),
});

export const statusUpdateSchema = z.object({
  status: z.enum(["unread", "read", "in_progress", "resolved"]),
});

// Q&A 질문 스키마 (국원이 공개 게시판에 질문)
export const questionSchema = z.object({
  questioner_name: z.string().min(1, "이름을 입력해주세요.").max(50),
  questioner_role: z.enum(["기자", "PD", "기타"]),
  content: z.string().min(5, "질문 내용을 5자 이상 입력해주세요.").max(2000, "최대 2000자까지 입력 가능합니다."),
});

// Q&A 답변 스키마 (국부국 어드민)
export const questionReplySchema = z.object({
  content: z.string().min(1, "답변 내용을 입력해주세요.").max(2000, "최대 2000자까지 입력 가능합니다."),
});

export type SubmissionInput = z.infer<typeof submissionSchema>;
export type ProposalInput = z.infer<typeof proposalSchema>;
export type ProposalFeedbackInput = z.infer<typeof proposalFeedbackSchema>;
export type QuestionInput = z.infer<typeof questionSchema>;
export type QuestionReplyInput = z.infer<typeof questionReplySchema>;
