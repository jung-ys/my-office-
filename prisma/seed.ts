/**
 * 초기 예시 데이터를 생성합니다.
 * 실제 운영 시에는 /admin 페이지에서 교재·영상·학생을 직접 추가/수정하는 것을 권장합니다.
 * (아래 videoUrl은 예시입니다. 네이버 마이박스에서 파일 우클릭 → 공유 → 링크 만들기로
 *  실제 공유 링크를 받아 관리자 페이지에서 교체해주세요.)
 */
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  // 기존 데이터 정리 (개발용 재시드)
  await prisma.progress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.textbook.deleteMany();
  await prisma.student.deleteMany();

  const grammar1 = await prisma.textbook.create({
    data: {
      title: "기초 문법 1권",
      order: 1,
      videos: {
        create: [
          {
            title: "1강. be동사란 무엇인가",
            order: 1,
            videoUrl: "https://mybox.naver.com/example/1강-be동사",
            duration: 9,
          },
          {
            title: "2강. be동사의 부정문",
            order: 2,
            videoUrl: "https://mybox.naver.com/example/2강-be동사-부정문",
            duration: 10,
          },
          {
            title: "3강. be동사의 의문문",
            order: 3,
            videoUrl: "https://mybox.naver.com/example/3강-be동사-의문문",
            duration: 8,
          },
          {
            title: "4강. 일반동사 현재형",
            order: 4,
            videoUrl: "https://mybox.naver.com/example/4강-일반동사-현재형",
            duration: 11,
          },
        ],
      },
    },
  });

  const grammar2 = await prisma.textbook.create({
    data: {
      title: "기초 문법 2권",
      order: 2,
      videos: {
        create: [
          {
            title: "1강. 과거시제",
            order: 1,
            videoUrl: "https://mybox.naver.com/example/2권-1강-과거시제",
            duration: 10,
          },
          {
            title: "2강. 미래시제",
            order: 2,
            videoUrl: "https://mybox.naver.com/example/2권-2강-미래시제",
            duration: 9,
          },
          {
            title: "3강. 현재진행형",
            order: 3,
            videoUrl: "https://mybox.naver.com/example/2권-3강-현재진행형",
            duration: 10,
          },
        ],
      },
    },
  });

  const students = await Promise.all(
    ["김민준", "이서연", "박도윤", "최지우"].map((name) =>
      prisma.student.create({ data: { name } })
    )
  );

  // 예시로 첫 학생은 1권 1~2강을 이미 시청한 것으로 설정 (오늘의 학습이 3강으로 뜨는지 확인용)
  const firstBookVideos = await prisma.video.findMany({
    where: { textbookId: grammar1.id },
    orderBy: { order: "asc" },
  });

  for (const video of firstBookVideos.slice(0, 2)) {
    await prisma.progress.create({
      data: {
        studentId: students[0].id,
        videoId: video.id,
        watched: true,
        firstWatchedAt: new Date(),
        lastWatchedAt: new Date(),
      },
    });
  }

  console.log("시드 데이터 생성 완료:");
  console.log(`- 교재 2개 (${grammar1.title}, ${grammar2.title})`);
  console.log(`- 학생 ${students.length}명: ${students.map((s) => s.name).join(", ")}`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
