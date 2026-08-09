-- 지금까지 0부터 시작하던 순서(order) 값을 실제 교재 번호와 맞도록 1부터 시작하게 보정합니다.
-- (데이터를 지우지 않고 숫자만 +1 합니다. 새로 시드되는 데이터는 이미 1부터 생성되므로
--  이 마이그레이션이 이미 실행된 뒤 들어온 데이터에는 영향이 없습니다.)
UPDATE "Subject" SET "order" = "order" + 1;
UPDATE "Series" SET "order" = "order" + 1;
UPDATE "Chapter" SET "order" = "order" + 1;
UPDATE "Video" SET "order" = "order" + 1;
