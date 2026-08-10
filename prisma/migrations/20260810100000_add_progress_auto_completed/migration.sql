-- "시작 지점 설정"으로 일괄 완료 처리된 진도와, 학생이 실제로 시청 완료한 진도를
-- 구분하기 위한 컬럼을 추가합니다. 기존 행은 전부 실제 시청 기록이므로 기본값 false로 채웁니다.
ALTER TABLE "Progress" ADD COLUMN "autoCompleted" BOOLEAN NOT NULL DEFAULT false;
