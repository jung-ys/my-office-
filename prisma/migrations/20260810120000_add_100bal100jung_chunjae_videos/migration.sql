-- "백발백중 최종점검" 교재 3권(천재(소) 1학기, 천재(소) 2학기, 동아(윤) 2학기)의
-- Lesson(챕터)과 세부 섹션(Vocabulary/Dialog/Grammar/Reading 등)별 영상 자리를
-- 목차 그대로 미리 만들어둡니다. videoUrl은 빈 문자열로 "준비 중" 상태로 두고,
-- 실제 영상 링크·길이는 관리자 페이지에서 나중에 채우면 됩니다.
-- 이미 같은 제목의 챕터가 있으면 건너뛰는 방식이라 여러 번 배포돼도 중복 생성되지 않습니다.
DO $$
DECLARE
  subj_id TEXT;
  chunjae1_id TEXT; -- 천재(소) 1학기
  chunjae2_id TEXT; -- 천재(소) 2학기
  donga2_id TEXT;   -- 동아(윤) 2학기
  ch_id TEXT;
BEGIN
  SELECT id INTO subj_id FROM "Subject" WHERE label LIKE '%내신대비%' LIMIT 1;
  IF subj_id IS NULL THEN
    RAISE NOTICE '내신대비 과목을 찾지 못해 건너뜁니다.';
    RETURN;
  END IF;

  SELECT id INTO chunjae1_id FROM "Series" WHERE "subjectId" = subj_id AND title = '백발백중 최종점검 천재(소) 1학년 1학기' LIMIT 1;
  SELECT id INTO chunjae2_id FROM "Series" WHERE "subjectId" = subj_id AND title = '백발백중 최종점검 천재(소) 1학년 2학기' LIMIT 1;
  SELECT id INTO donga2_id FROM "Series" WHERE "subjectId" = subj_id AND title = '백발백중 최종점검 동아(윤) 2학년 2학기' LIMIT 1;

  -- ================= 천재(소) 1학기 =================
  IF chunjae1_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae1_id AND title = 'Lesson 01 New Start, New Friends') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj1-l1');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae1_id, 'Lesson 01 New Start, New Friends', 1);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.8'),(2,'Dialog 대화','p.14'),(3,'Grammar 문법','p.26'),(4,'Reading 독해','p.34'),
        (5,'Plus 기타 지문','p.50'),(6,'서술형 끝내기','p.52'),(7,'100발100중 모의고사','p.56'),(8,'고득점 모의고사','p.60')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae1_id AND title = 'Lesson 02 Happy School Days') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj1-l2');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae1_id, 'Lesson 02 Happy School Days', 2);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.66'),(2,'Dialog 대화','p.72'),(3,'Grammar 문법','p.84'),(4,'Reading 독해','p.92'),
        (5,'Plus 기타 지문','p.108'),(6,'서술형 끝내기','p.110'),(7,'100발100중 모의고사','p.114'),(8,'고득점 모의고사','p.118')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae1_id AND title = 'Lesson 03 Together with Animals') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj1-l3');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae1_id, 'Lesson 03 Together with Animals', 3);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.124'),(2,'Dialog 대화','p.130'),(3,'Grammar 문법','p.142'),(4,'Reading 독해','p.150'),
        (5,'Plus 기타 지문','p.166'),(6,'서술형 끝내기','p.168'),(7,'100발100중 모의고사','p.172'),(8,'고득점 모의고사','p.176')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae1_id AND title = 'Lesson 04 My Delicious Summer Trip') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj1-l4');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae1_id, 'Lesson 04 My Delicious Summer Trip', 4);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.182'),(2,'Dialog 대화','p.188'),(3,'Grammar 문법','p.200'),(4,'Reading 독해','p.208'),
        (5,'Plus 기타 지문','p.224'),(6,'서술형 끝내기','p.226'),(7,'100발100중 모의고사','p.230'),(8,'고득점 모의고사','p.234')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae1_id AND title = 'Lesson 05 Share Your Joys and Worries') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj1-l5');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae1_id, 'Lesson 05 Share Your Joys and Worries', 5);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.240'),(2,'Dialog 대화','p.246'),(3,'Grammar 문법','p.258'),(4,'Reading 독해','p.266'),
        (5,'Plus 기타 지문','p.282'),(6,'서술형 끝내기','p.284'),(7,'100발100중 모의고사','p.288'),(8,'고득점 모의고사','p.292')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae1_id AND title = 'X-10 워크북') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj1-x10');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae1_id, 'X-10 워크북', 6);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Part I 시험 대비 암기 노트 (Lesson 01~05)',NULL),
        (2,'Part II 최종점검 모의고사 (1학기 모의고사)',NULL)
      ) AS s(ord, title, page);
    END IF;
  END IF;

  -- ================= 천재(소) 2학기 =================
  IF chunjae2_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae2_id AND title = 'Lesson 05 Share Your Joys and Worries') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj2-l5');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae2_id, 'Lesson 05 Share Your Joys and Worries', 1);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.8'),(2,'Dialog 대화','p.14'),(3,'Grammar 문법','p.26'),(4,'Reading 독해','p.34'),
        (5,'Plus 기타 지문','p.50'),(6,'서술형 끝내기','p.52'),(7,'100발100중 모의고사','p.56'),(8,'고득점 모의고사','p.60')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae2_id AND title = 'Lesson 06 Heroes in Nature') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj2-l6');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae2_id, 'Lesson 06 Heroes in Nature', 2);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.66'),(2,'Dialog 대화','p.72'),(3,'Grammar 문법','p.84'),(4,'Reading 독해','p.92'),
        (5,'Plus 기타 지문','p.108'),(6,'서술형 끝내기','p.110'),(7,'100발100중 모의고사','p.114'),(8,'고득점 모의고사','p.118')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae2_id AND title = 'Lesson 07 Love for Art') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj2-l7');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae2_id, 'Lesson 07 Love for Art', 3);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.124'),(2,'Dialog 대화','p.130'),(3,'Grammar 문법','p.142'),(4,'Reading 독해','p.150'),
        (5,'Plus 기타 지문','p.166'),(6,'서술형 끝내기','p.168'),(7,'100발100중 모의고사','p.172'),(8,'고득점 모의고사','p.176')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae2_id AND title = 'Special Lesson Three Goats and a Troll') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj2-sp');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae2_id, 'Special Lesson Three Goats and a Troll', 4);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.182'),(2,'Grammar 문법','p.188'),(3,'Reading 독해','p.194'),
        (4,'100발100중 모의고사','p.214'),(5,'고득점 모의고사','p.217')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = chunjae2_id AND title = 'X-10 워크북') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'cj2-x10');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, chunjae2_id, 'X-10 워크북', 5);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Part I 시험 대비 암기 노트 (Lesson 05~Special Lesson)',NULL),
        (2,'Part II 최종점검 모의고사 (2학기 모의고사)',NULL)
      ) AS s(ord, title, page);
    END IF;
  END IF;

  -- ================= 동아(윤) 2학기 =================
  IF donga2_id IS NOT NULL THEN
    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = donga2_id AND title = 'Lesson 05 The City as a Canvas') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'dg2-l5');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, donga2_id, 'Lesson 05 The City as a Canvas', 1);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.8'),(2,'Dialog 대화','p.14'),(3,'Grammar 문법','p.26'),(4,'Reading 독해','p.34'),
        (5,'Plus 기타 지문','p.50'),(6,'서술형 끝내기','p.52'),(7,'100발100중 모의고사','p.56'),(8,'고득점 모의고사','p.60')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = donga2_id AND title = 'Lesson 06 The Greatest Love for All') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'dg2-l6');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, donga2_id, 'Lesson 06 The Greatest Love for All', 2);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.66'),(2,'Dialog 대화','p.72'),(3,'Grammar 문법','p.84'),(4,'Reading 독해','p.92'),
        (5,'Plus 기타 지문','p.108'),(6,'서술형 끝내기','p.110'),(7,'100발100중 모의고사','p.114'),(8,'고득점 모의고사','p.118')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = donga2_id AND title = 'Lesson 07 Let''s Enjoy Festivals') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'dg2-l7');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, donga2_id, 'Lesson 07 Let''s Enjoy Festivals', 3);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.124'),(2,'Dialog 대화','p.130'),(3,'Grammar 문법','p.142'),(4,'Reading 독해','p.150'),
        (5,'Plus 기타 지문','p.166'),(6,'서술형 끝내기','p.168'),(7,'100발100중 모의고사','p.172'),(8,'고득점 모의고사','p.176')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = donga2_id AND title = 'Lesson 08 Time Travel') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'dg2-l8');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, donga2_id, 'Lesson 08 Time Travel', 4);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Vocabulary 어휘','p.182'),(2,'Grammar 문법','p.188'),(3,'Reading 독해','p.196'),
        (4,'Plus 기타 지문','p.220'),(5,'서술형 끝내기','p.222'),(6,'100발100중 모의고사','p.226'),(7,'고득점 모의고사','p.230')
      ) AS s(ord, title, page);
    END IF;

    IF NOT EXISTS (SELECT 1 FROM "Chapter" WHERE "seriesId" = donga2_id AND title = 'X-10 워크북') THEN
      ch_id := md5(random()::text || clock_timestamp()::text || 'dg2-x10');
      INSERT INTO "Chapter" (id, "seriesId", title, "order") VALUES (ch_id, donga2_id, 'X-10 워크북', 5);
      INSERT INTO "Video" (id, "chapterId", title, page, "order", "videoUrl")
      SELECT md5(random()::text || clock_timestamp()::text || ch_id || s.ord::text), ch_id, s.title, s.page, s.ord, ''
      FROM (VALUES
        (1,'Part I 시험 대비 암기 노트 (Lesson 05~08)',NULL),
        (2,'Part II 최종점검 모의고사 (2학기 모의고사)',NULL)
      ) AS s(ord, title, page);
    END IF;
  END IF;
END $$;
