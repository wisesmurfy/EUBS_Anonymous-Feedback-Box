// =====================================================
// Submission (익명 소리함)
// =====================================================

export type SubmissionType = "feedback" | "report";

export type SubmissionStatus = "unread" | "read" | "in_progress" | "resolved";

export type FeedbackCategory =
  | "program"
  | "equipment"
  | "operations"
  | "culture"
  | "other";

export type ReportCategory =
  | "conflict"
  | "misconduct"
  | "safety"
  | "other";

export type SubmissionCategory = FeedbackCategory | ReportCategory;

export interface Submission {
  id: string;
  type: SubmissionType;
  category: SubmissionCategory | null;
  content: string;
  is_urgent: boolean;
  answer_email: string | null;
  status: SubmissionStatus;
  admin_note: string | null;
  created_at: string;
  updated_at: string;
  read_at: string | null;
  resolved_at: string | null;
}

export interface SubmissionInsert {
  type: SubmissionType;
  category?: SubmissionCategory;
  content: string;
  is_urgent?: boolean;
  answer_email?: string;
}

// =====================================================
// Admin
// =====================================================

export interface AdminProfile {
  id: string;
  display_name: string;
  email_notify: boolean;
  created_at: string;
}

export type ActivityAction = "read" | "status_change" | "note_added" | "replied";

export interface AdminActivityLog {
  id: string;
  admin_id: string;
  submission_id: string;
  action: ActivityAction;
  meta: Record<string, unknown> | null;
  created_at: string;
  // Joined
  admin_profiles?: { display_name: string };
}

// =====================================================
// Proposal (기획안)
// =====================================================

export type ProgramType = "radio" | "tv" | "online" | "event" | "other";

export type ProposalStatus = "pending" | "reviewed" | "approved" | "rejected";

export interface Proposal {
  id: string;
  title: string;
  program_type: ProgramType;
  submitter_name: string;
  submitter_email: string;
  content: string;
  view_token: string;
  status: ProposalStatus;
  created_at: string;
  updated_at: string;
  // Joined
  proposal_feedbacks?: ProposalFeedback[];
}

export interface ProposalInsert {
  title: string;
  program_type: ProgramType;
  submitter_name: string;
  submitter_email: string;
  content: string;
}

export interface FeedbackSection {
  title: string;
  score: number;
  max_score: number;
  comment: string;
}

export interface ProposalFeedback {
  id: string;
  proposal_id: string;
  admin_id: string;
  sections: FeedbackSection[];
  overall_comment: string | null;
  created_at: string;
  updated_at: string;
  // Joined
  admin_profiles?: { display_name: string };
}

// =====================================================
// UI Helpers
// =====================================================

export const SUBMISSION_STATUS_LABELS: Record<SubmissionStatus, string> = {
  unread: "미확인",
  read: "확인",
  in_progress: "처리중",
  resolved: "완료",
};

export const SUBMISSION_TYPE_LABELS: Record<SubmissionType, string> = {
  feedback: "피드백",
  report: "신고",
};

export const FEEDBACK_CATEGORY_LABELS: Record<FeedbackCategory, string> = {
  program: "프로그램",
  equipment: "장비/시설",
  operations: "운영",
  culture: "동아리 문화",
  other: "기타",
};

export const REPORT_CATEGORY_LABELS: Record<ReportCategory, string> = {
  conflict: "갈등/분쟁",
  misconduct: "부적절한 행동",
  safety: "안전 문제",
  other: "기타",
};

export const PROGRAM_TYPE_LABELS: Record<ProgramType, string> = {
  radio: "라디오",
  tv: "TV",
  online: "온라인/SNS",
  event: "이벤트",
  other: "기타",
};

export const PROPOSAL_STATUS_LABELS: Record<ProposalStatus, string> = {
  pending: "검토 대기",
  reviewed: "검토 완료",
  approved: "승인",
  rejected: "반려",
};
