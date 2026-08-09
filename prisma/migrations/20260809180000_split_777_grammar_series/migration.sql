-- "777 초등영문법" 시리즈를 0권~6권 각각 별도의 시리즈로 분리합니다.
-- 기존 챕터/영상/진도/배정 데이터는 그대로 유지한 채, 챕터를 새로 만든 시리즈로 옮기고
-- (삭제하지 않음) 비어버린 기존 시리즈만 삭제합니다.
DO $$
DECLARE
  old_series_id TEXT;
  subj_id TEXT;
  ch RECORD;
  new_series_id TEXT;
BEGIN
  SELECT id, "subjectId" INTO old_series_id, subj_id
  FROM "Series"
  WHERE title = '777 초등영문법'
  LIMIT 1;

  IF old_series_id IS NOT NULL THEN
    FOR ch IN
      SELECT id, title, "order" FROM "Chapter" WHERE "seriesId" = old_series_id ORDER BY "order" ASC
    LOOP
      new_series_id := md5(random()::text || clock_timestamp()::text || ch.id);
      INSERT INTO "Series" (id, "subjectId", title, "order")
      VALUES (new_series_id, subj_id, '777 초등영문법 ' || ch.title, ch."order");
      UPDATE "Chapter" SET "seriesId" = new_series_id WHERE id = ch.id;
    END LOOP;

    DELETE FROM "Series" WHERE id = old_series_id;
  END IF;
END $$;
