-- 학생별로 배정된 교재(시리즈)만 볼 수 있게 하는 조인 테이블 추가
CREATE TABLE "StudentSeries" (
    "id" TEXT NOT NULL,
    "studentId" TEXT NOT NULL,
    "seriesId" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "StudentSeries_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "StudentSeries_studentId_seriesId_key" ON "StudentSeries"("studentId", "seriesId");

ALTER TABLE "StudentSeries" ADD CONSTRAINT "StudentSeries_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "StudentSeries" ADD CONSTRAINT "StudentSeries_seriesId_fkey" FOREIGN KEY ("seriesId") REFERENCES "Series"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- 시청 완료까지 화면에 머문 시간(초) 기록용 컬럼 (스킵 방지 참고용, 선택값)
ALTER TABLE "Progress" ADD COLUMN "watchSeconds" INTEGER;
