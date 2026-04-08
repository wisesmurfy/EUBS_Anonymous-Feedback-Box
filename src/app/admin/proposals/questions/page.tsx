import { createAdminClient } from "@/lib/supabase/server";
import { AdminQuestionList } from "@/components/admin/AdminQuestionList";

export default async function AdminQuestionsPage() {
  const supabase = createAdminClient();

  const { data: questions } = await supabase
    .from("proposal_questions")
    .select(`
      id,
      questioner_name,
      questioner_role,
      content,
      created_at,
      proposal_question_replies (
        id,
        content,
        created_at,
        updated_at
      )
    `)
    .order("created_at", { ascending: false });

  const total = questions?.length ?? 0;
  const unanswered = questions?.filter((q) => !q.proposal_question_replies?.length).length ?? 0;

  return (
    <div className="p-6">
      <div className="mb-6">
        <h1 className="text-xl font-bold text-gray-900">기획안 Q&A</h1>
        <p className="mt-0.5 text-sm text-gray-500">국원들의 질문에 답변하세요</p>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-gray-100">
          <p className="text-xs text-gray-500">전체 질문</p>
          <p className="mt-1 text-2xl font-bold text-gray-900">{total}</p>
        </div>
        <div className="rounded-2xl bg-white p-4 shadow-sm ring-1 ring-amber-100">
          <p className="text-xs text-gray-500">답변 대기</p>
          <p className="mt-1 text-2xl font-bold text-amber-600">{unanswered}</p>
        </div>
      </div>

      <AdminQuestionList initialQuestions={questions ?? []} />
    </div>
  );
}
