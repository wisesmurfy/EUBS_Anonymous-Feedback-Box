-- =====================================================
-- EUBS 익명 소리함 — Initial Schema
-- =====================================================

-- =====================================================
-- 1. SUBMISSIONS (익명 소리함)
-- =====================================================
CREATE TABLE IF NOT EXISTS submissions (
  id            UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  type          TEXT NOT NULL CHECK (type IN ('feedback', 'report')),
  category      TEXT,
  content       TEXT NOT NULL,
  is_urgent     BOOLEAN NOT NULL DEFAULT false,
  -- 신고 시 선택적 답변 수신 이메일 (피드백은 항상 NULL)
  answer_email  TEXT,
  status        TEXT NOT NULL DEFAULT 'unread'
                  CHECK (status IN ('unread', 'read', 'in_progress', 'resolved')),
  admin_note    TEXT,
  created_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ NOT NULL DEFAULT now(),
  read_at       TIMESTAMPTZ,
  resolved_at   TIMESTAMPTZ
);

-- 피드백은 answer_email 금지
ALTER TABLE submissions
  ADD CONSTRAINT feedback_no_email
  CHECK (type != 'feedback' OR answer_email IS NULL);

-- =====================================================
-- 2. ADMIN PROFILES
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_profiles (
  id              UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name    TEXT NOT NULL,
  email_notify    BOOLEAN NOT NULL DEFAULT true,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 3. ADMIN ACTIVITY LOG
-- =====================================================
CREATE TABLE IF NOT EXISTS admin_activity_log (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admin_id        UUID NOT NULL REFERENCES admin_profiles(id),
  submission_id   UUID NOT NULL REFERENCES submissions(id) ON DELETE CASCADE,
  action          TEXT NOT NULL CHECK (action IN ('read', 'status_change', 'note_added', 'replied')),
  meta            JSONB,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 4. PROPOSALS (기획안)
-- =====================================================
CREATE TABLE IF NOT EXISTS proposals (
  id                UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title             TEXT NOT NULL,
  program_type      TEXT NOT NULL CHECK (program_type IN ('radio', 'tv', 'online', 'event', 'other')),
  submitter_name    TEXT NOT NULL,
  submitter_email   TEXT NOT NULL,
  content           TEXT NOT NULL,
  view_token        UUID NOT NULL DEFAULT gen_random_uuid() UNIQUE,
  status            TEXT NOT NULL DEFAULT 'pending'
                      CHECK (status IN ('pending', 'reviewed', 'approved', 'rejected')),
  created_at        TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at        TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 5. PROPOSAL FEEDBACKS (기획안 피드백)
-- =====================================================
CREATE TABLE IF NOT EXISTS proposal_feedbacks (
  id              UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  proposal_id     UUID NOT NULL REFERENCES proposals(id) ON DELETE CASCADE,
  admin_id        UUID NOT NULL REFERENCES admin_profiles(id),
  -- JSONB 배열: [{ "title": "기획 의도", "score": 4, "max_score": 5, "comment": "..." }]
  sections        JSONB NOT NULL DEFAULT '[]',
  overall_comment TEXT,
  created_at      TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at      TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- 6. TRIGGERS — auto-update updated_at
-- =====================================================
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER submissions_updated_at
  BEFORE UPDATE ON submissions
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER proposals_updated_at
  BEFORE UPDATE ON proposals
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

CREATE TRIGGER proposal_feedbacks_updated_at
  BEFORE UPDATE ON proposal_feedbacks
  FOR EACH ROW EXECUTE FUNCTION update_updated_at();

-- =====================================================
-- 7. ROW LEVEL SECURITY
-- =====================================================
ALTER TABLE submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE admin_activity_log ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposals ENABLE ROW LEVEL SECURITY;
ALTER TABLE proposal_feedbacks ENABLE ROW LEVEL SECURITY;

-- Helper: is current user an admin?
CREATE OR REPLACE FUNCTION is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM admin_profiles WHERE id = auth.uid()
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ---- submissions ----
-- 누구나 익명 제출 가능
CREATE POLICY "anon_insert_submissions"
  ON submissions FOR INSERT TO anon WITH CHECK (true);

-- 관리자만 조회
CREATE POLICY "admin_select_submissions"
  ON submissions FOR SELECT TO authenticated USING (is_admin());

-- 관리자만 상태/메모 업데이트
CREATE POLICY "admin_update_submissions"
  ON submissions FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- 삭제 불가 (정책 없음 = 묵시적 거부)

-- ---- admin_profiles ----
CREATE POLICY "admin_select_own_profile"
  ON admin_profiles FOR SELECT TO authenticated USING (id = auth.uid());

CREATE POLICY "admin_update_own_profile"
  ON admin_profiles FOR UPDATE TO authenticated
  USING (id = auth.uid()) WITH CHECK (id = auth.uid());

-- ---- admin_activity_log ----
CREATE POLICY "admin_select_activity"
  ON admin_activity_log FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "admin_insert_activity"
  ON admin_activity_log FOR INSERT TO authenticated
  WITH CHECK (admin_id = auth.uid() AND is_admin());

-- ---- proposals ----
-- 누구나 기획안 제출
CREATE POLICY "anon_insert_proposals"
  ON proposals FOR INSERT TO anon WITH CHECK (true);

-- 관리자만 조회/수정
CREATE POLICY "admin_select_proposals"
  ON proposals FOR SELECT TO authenticated USING (is_admin());

CREATE POLICY "admin_update_proposals"
  ON proposals FOR UPDATE TO authenticated
  USING (is_admin()) WITH CHECK (is_admin());

-- view_token으로 본인 기획안만 조회 (국원용)
CREATE POLICY "token_select_proposal"
  ON proposals FOR SELECT TO anon
  USING (true); -- API 레이어에서 token 필터링 (RLS 단에서는 anon SELECT 허용, 서버에서 token 검증)

-- ---- proposal_feedbacks ----
CREATE POLICY "admin_all_feedbacks"
  ON proposal_feedbacks FOR ALL TO authenticated USING (is_admin());

-- 국원은 API를 통해 피드백 조회 (서버에서 token 검증 후 service_role로 조회)
-- anon 직접 조회 불가
