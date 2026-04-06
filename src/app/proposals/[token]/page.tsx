import { notFound } from "next/navigation";
import { Header } from "@/components/layout/Header";
import { ProposalStatusBadge } from "@/components/ui/Badge";
import { formatDate } from "@/lib/utils/format";
import { PROGRAM_TYPE_LABELS, type FeedbackSection, type ProposalStatus, type ProgramType } from "@/lib/types";

async function getProposal(token: string) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL ?? "http://localhost:3000";
  const res = await fetch(`${appUrl}/api/proposals/${token}`, {
    cache: "no-store",
  });
  if (!res.ok) return null;
  const data = await res.json();
  return data.proposal;
}

export default async function ProposalViewPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const proposal = await getProposal(token);

  if (!proposal) notFound();

  const feedback = proposal.proposal_feedbacks?.[0];
  const totalScore = feedback?.sections?.reduce(
    (sum: number, s: FeedbackSection) => sum + s.score,
    0
  ) ?? 0;
  const maxTotalScore = feedback?.sections?.reduce(
    (sum: number, s: FeedbackSection) => sum + s.max_score,
    0
  ) ?? 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-8">
        {/* 헤더 */}
        <div className="mb-6">
          <div className="mb-2 flex items-center gap-2">
            <ProposalStatusBadge status={proposal.status as ProposalStatus} />
            <span className="text-xs text-gray-400">
              {PROGRAM_TYPE_LABELS[proposal.program_type as ProgramType]}
            </span>
          </div>
          <h1 className="text-xl font-bold tracking-tight text-gray-900">{proposal.title}</h1>
          <p className="mt-1 text-sm text-gray-400">
            {proposal.submitter_name} · {formatDate(proposal.created_at)}
          </p>
        </div>

        {/* 기획안 내용 */}
        <div className="mb-6 rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
          <h2 className="mb-3 text-sm font-semibold text-gray-700">기획안 내용</h2>
          <p className="whitespace-pre-wrap text-sm leading-relaxed text-gray-700">
            {proposal.content}
          </p>
        </div>

        {/* 피드백 */}
        {feedback ? (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-gray-900">국부국 피드백</h2>
              {maxTotalScore > 0 && (
                <div className="flex items-center gap-1.5">
                  <span className="text-xl font-bold text-ewha-700">{totalScore}</span>
                  <span className="text-sm text-gray-400">/ {maxTotalScore}점</span>
                </div>
              )}
            </div>

            {/* 섹션별 피드백 */}
            {(feedback.sections as FeedbackSection[]).map((section, i) => (
              <div key={i} className="rounded-2xl bg-white p-5 shadow-sm ring-1 ring-gray-100">
                <div className="mb-3 flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-gray-900">{section.title}</h3>
                  <div className="flex items-center gap-1">
                    {Array.from({ length: section.max_score }).map((_, j) => (
                      <div
                        key={j}
                        className={`h-2 w-2 rounded-full ${
                          j < section.score ? "bg-ewha-700" : "bg-gray-200"
                        }`}
                      />
                    ))}
                    <span className="ml-1.5 text-xs text-gray-500">
                      {section.score}/{section.max_score}
                    </span>
                  </div>
                </div>
                {/* Score bar */}
                <div className="mb-3 h-1.5 overflow-hidden rounded-full bg-gray-100">
                  <div
                    className="h-full rounded-full bg-ewha-700 transition-all"
                    style={{ width: `${(section.score / section.max_score) * 100}%` }}
                  />
                </div>
                {section.comment && (
                  <p className="text-sm leading-relaxed text-gray-600">{section.comment}</p>
                )}
              </div>
            ))}

            {/* 종합 의견 */}
            {feedback.overall_comment && (
              <div className="rounded-2xl border border-ewha-100 bg-ewha-50 p-5">
                <h3 className="mb-2 text-sm font-semibold text-ewha-800">종합 의견</h3>
                <p className="whitespace-pre-wrap text-sm leading-relaxed text-ewha-900">
                  {feedback.overall_comment}
                </p>
                <p className="mt-3 text-xs text-ewha-600">
                  — {feedback.admin_profiles?.display_name ?? "국부국"} ·{" "}
                  {formatDate(feedback.created_at)}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="rounded-2xl bg-white p-8 text-center shadow-sm ring-1 ring-gray-100">
            <div className="mx-auto mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-gray-100">
              <svg className="h-6 w-6 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.8}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-gray-600">피드백 작성 중</p>
            <p className="mt-1 text-xs text-gray-400">
              국부국이 기획안을 검토하고 있습니다. 피드백이 완료되면 이메일로 안내드립니다.
            </p>
          </div>
        )}
      </main>
    </div>
  );
}
