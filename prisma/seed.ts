/**
 * 실제 커리큘럼 데이터로 초기 시드를 생성합니다.
 * 영상 링크(videoUrl)는 비어있는 상태로 들어가며, 실제 링크는 /admin 에서 채워주세요.
 *
 * 데이터/로직은 lib/seedData.ts에 있습니다 (관리자 페이지의 "초기 데이터 넣기"
 * 버튼과 같은 코드를 공유합니다).
 */
import { PrismaClient } from "@prisma/client";
import { runSeed } from "../lib/seedData";

const prisma = new PrismaClient();

async function main() {
  const result = await runSeed(prisma);
  console.log("시드 데이터 생성 완료:");
  for (const s of result.subjects) {
    console.log(`- ${s.label}: 시리즈 ${s.seriesCount}개, 강의 ${s.lessonCount}개`);
  }
  console.log(`- 학생 ${result.studentCount}명: ${result.studentNames.join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
