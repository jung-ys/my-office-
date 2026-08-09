-- 학생 로그인 방식을 "이름 클릭 + PIN"에서 "아이디 + 이름 직접 입력"으로 변경하며
-- pin 컬럼을 loginId로 이름만 바꿉니다 (기존 값은 그대로 유지).
ALTER TABLE "Student" RENAME COLUMN "pin" TO "loginId";

-- CreateIndex
CREATE UNIQUE INDEX "Student_loginId_key" ON "Student"("loginId");
