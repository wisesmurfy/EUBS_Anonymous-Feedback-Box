import { cn } from "@/lib/utils/cn";
import type { SubmissionStatus, SubmissionType, ProposalStatus } from "@/lib/types";

interface BadgeProps {
  children: React.ReactNode;
  className?: string;
  variant?: "default" | "green" | "yellow" | "red" | "blue" | "gray";
}

export function Badge({ children, className, variant = "default" }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold",
        {
          "bg-ewha-100 text-ewha-700": variant === "default" || variant === "green",
          "bg-amber-100 text-amber-700": variant === "yellow",
          "bg-red-100 text-red-700": variant === "red",
          "bg-blue-100 text-blue-700": variant === "blue",
          "bg-gray-100 text-gray-600": variant === "gray",
        },
        className
      )}
    >
      {children}
    </span>
  );
}

export function StatusBadge({ status }: { status: SubmissionStatus }) {
  const config: Record<SubmissionStatus, { label: string; variant: BadgeProps["variant"] }> = {
    unread: { label: "미확인", variant: "red" },
    read: { label: "확인", variant: "gray" },
    in_progress: { label: "처리중", variant: "yellow" },
    resolved: { label: "완료", variant: "green" },
  };
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}

export function TypeBadge({ type }: { type: SubmissionType }) {
  return (
    <Badge variant={type === "report" ? "red" : "green"}>
      {type === "feedback" ? "피드백" : "신고"}
    </Badge>
  );
}

export function ProposalStatusBadge({ status }: { status: ProposalStatus }) {
  const config: Record<ProposalStatus, { label: string; variant: BadgeProps["variant"] }> = {
    pending: { label: "검토 대기", variant: "gray" },
    reviewed: { label: "검토 완료", variant: "blue" },
    approved: { label: "승인", variant: "green" },
    rejected: { label: "반려", variant: "red" },
  };
  const { label, variant } = config[status];
  return <Badge variant={variant}>{label}</Badge>;
}
