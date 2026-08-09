-- 777 초등영문법 0~6권 분리 마이그레이션 당시, 기존 "1316 중등문법1" 시리즈의
-- order 값(2)이 새로 만든 "777 초등영문법 1권"의 order 값(2)과 겹치면서
-- 관리자 화면에서 두 교재의 순서가 뒤섞여 보이는 문제를 바로잡습니다.
-- 777 초등영문법 0권~6권이 순서대로 먼저 오고, 그 다음 1316 중등문법1이 오도록
-- order 값을 다시 매깁니다. (데이터 삭제 없이 order 값만 갱신)
DO $$
DECLARE
  subj_id TEXT;
  ch RECORD;
  idx INT := 1;
BEGIN
  SELECT "subjectId" INTO subj_id FROM "Series" WHERE title = '777 초등영문법 0권' LIMIT 1;
  IF subj_id IS NOT NULL THEN
    FOR ch IN
      SELECT id, title FROM "Series"
      WHERE "subjectId" = subj_id AND title LIKE '777 초등영문법 %권'
      ORDER BY (regexp_match(title, '(\d+)권$'))[1]::int ASC
    LOOP
      UPDATE "Series" SET "order" = idx WHERE id = ch.id;
      idx := idx + 1;
    END LOOP;

    UPDATE "Series" SET "order" = idx WHERE "subjectId" = subj_id AND title = '1316 중등문법1';
    idx := idx + 1;
  END IF;
END $$;
