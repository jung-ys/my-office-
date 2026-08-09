-- 학생 배정 단위를 "시리즈 전체"에서 "챕터(권/유닛)" 단위로 세분화합니다.
CREATE TABLE "StudentChapter" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "chapterId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentChapter_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentChapter_studentId_chapterId_key" ON "StudentChapter"("studentId", "chapterId");

ALTER TABLE "StudentChapter" ADD CONSTRAINT "StudentChapter_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentChapter" ADD CONSTRAINT "StudentChapter_chapterId_fkey" FOREIGN KEY ("chapterId") REFERENCES "Chapter"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 기존에 "시리즈 전체" 단위로 배정되어 있던 것을, 그 시리즈에 속한 모든 챕터에 대한
-- 배정으로 그대로 이어받습니다 (배정 정보가 사라지지 않도록).
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'StudentSeries') THEN
    INSERT INTO "StudentChapter" ("id", "studentId", "chapterId")
    SELECT md5(random()::text || clock_timestamp()::text || c."id" || ss."studentId"), ss."studentId", c."id"
    FROM "StudentSeries" ss
    JOIN "Chapter" c ON c."seriesId" = ss."seriesId";

    DROP TABLE "StudentSeries";
  END IF;
END $$;
