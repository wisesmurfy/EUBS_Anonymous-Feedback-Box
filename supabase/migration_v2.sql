-- ============================================================
-- EUBS 익명 소리함 - v2 마이그레이션
-- Supabase SQL Editor에서 실행하세요
-- ============================================================

-- 1. proposals 테이블에 broadcast_date 추가
ALTER TABLE proposals ADD COLUMN IF NOT EXISTS broadcast_date date;

-- 2. submitter_email nullable 허용 (국부국이 직접 등록 시 이메일 없을 수 있음)
ALTER TABLE proposals ALTER COLUMN submitter_email DROP NOT NULL;

-- 3. proposal_questions 테이블 (공개 Q&A)
CREATE TABLE IF NOT EXISTS proposal_questions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  questioner_name text NOT NULL CHECK (char_length(questioner_name) >= 1),
  questioner_role text NOT NULL CHECK (questioner_role IN ('기자', 'PD', '기타')),
  content text NOT NULL CHECK (char_length(content) >= 5),
  created_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE proposal_questions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read questions"
  ON proposal_questions FOR SELECT USING (true);

CREATE POLICY "Anyone can insert questions"
  ON proposal_questions FOR INSERT WITH CHECK (true);

-- 4. proposal_question_replies 테이블 (국부국 답변)
CREATE TABLE IF NOT EXISTS proposal_question_replies (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  question_id uuid REFERENCES proposal_questions(id) ON DELETE CASCADE NOT NULL,
  content text NOT NULL,
  created_at timestamptz DEFAULT now() NOT NULL,
  updated_at timestamptz DEFAULT now() NOT NULL
);

ALTER TABLE proposal_question_replies ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read replies"
  ON proposal_question_replies FOR SELECT USING (true);

CREATE POLICY "Authenticated users can insert replies"
  ON proposal_question_replies FOR INSERT WITH CHECK (auth.role() = 'authenticated');

CREATE POLICY "Authenticated users can update replies"
  ON proposal_question_replies FOR UPDATE USING (auth.role() = 'authenticated');

-- ============================================================
-- 참고: program_type 값 변경
-- 기존 데이터가 있다면 아래 UPDATE 문을 먼저 실행하세요.
-- 기존: radio, tv, online, event, other
-- 신규: 뉴스, 대담, 예능, 시사교양, 기타
--
-- UPDATE proposals SET program_type = '기타' WHERE program_type IN ('radio', 'tv', 'online', 'event', 'other');
-- ============================================================
