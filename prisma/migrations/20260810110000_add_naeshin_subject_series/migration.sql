-- "내신대비 영상" 과목과, 그 안에 넣을 시리즈(교재) 4개를 미리 만들어둡니다.
-- 이미 "내신대비"가 들어간 과목이 있으면 그걸 그대로 쓰고, 시리즈도 같은 이름이
-- 이미 있으면 건너뛰어서 여러 번 실행해도 중복 생성되지 않습니다. (순수 INSERT만 함)
DO $$
DECLARE
  subj_id TEXT;
BEGIN
  SELECT id INTO subj_id FROM "Subject" WHERE label LIKE '%내신대비%' LIMIT 1;

  IF subj_id IS NULL THEN
    subj_id := md5(random()::text || clock_timestamp()::text || 'naeshin-subject');
    INSERT INTO "Subject" (id, key, label, icon, "order")
    VALUES (
      subj_id,
      'subject-' || substr(md5(random()::text || clock_timestamp()::text), 1, 8),
      '내신대비 영상',
      '📝',
      (SELECT COALESCE(MAX("order"), 0) + 1 FROM "Subject")
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "Series" WHERE "subjectId" = subj_id AND title = '백발백중 최종점검 천재(소) 1학년 1학기'
  ) THEN
    INSERT INTO "Series" (id, "subjectId", title, "order")
    VALUES (
      md5(random()::text || clock_timestamp()::text || 'naeshin-1'),
      subj_id, '백발백중 최종점검 천재(소) 1학년 1학기', 1
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "Series" WHERE "subjectId" = subj_id AND title = '백발백중 최종점검 천재(소) 1학년 2학기'
  ) THEN
    INSERT INTO "Series" (id, "subjectId", title, "order")
    VALUES (
      md5(random()::text || clock_timestamp()::text || 'naeshin-2'),
      subj_id, '백발백중 최종점검 천재(소) 1학년 2학기', 2
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "Series" WHERE "subjectId" = subj_id AND title = '백발백중 최종점검 동아(윤) 2학년 1학기'
  ) THEN
    INSERT INTO "Series" (id, "subjectId", title, "order")
    VALUES (
      md5(random()::text || clock_timestamp()::text || 'naeshin-3'),
      subj_id, '백발백중 최종점검 동아(윤) 2학년 1학기', 3
    );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM "Series" WHERE "subjectId" = subj_id AND title = '백발백중 최종점검 동아(윤) 2학년 2학기'
  ) THEN
    INSERT INTO "Series" (id, "subjectId", title, "order")
    VALUES (
      md5(random()::text || clock_timestamp()::text || 'naeshin-4'),
      subj_id, '백발백중 최종점검 동아(윤) 2학년 2학기', 4
    );
  END IF;
END $$;
