/**
 * 실제 커리큘럼 + 학생 명단 데이터와, 이걸 DB에 넣는 함수입니다.
 * - prisma/seed.ts (로컬/CLI에서 `npm run db:seed`)
 * - app/admin/actions.ts의 runSeed 서버 액션 (배포된 사이트의 /admin에서 버튼으로 실행)
 * 양쪽에서 똑같은 데이터를 재사용합니다.
 *
 * ⚠️ runSeed()는 기존 Subject/Series/Chapter/Video/Progress/Student를 전부 지우고
 * 다시 만듭니다. 이미 등록한 영상 링크나 학생 진도가 있다면 사라지니, 운영 중인
 * 사이트에서는 "최초 1회"만 사용하세요.
 */
import type { PrismaClient } from "@prisma/client";

type SeedVideo = { title: string; page?: string; url?: string; duration?: number };
type SeedChapter = { title: string; lessons: SeedVideo[] };
type SeedSeries = { title: string; chapters: SeedChapter[] };
type SeedSubject = { key: string; label: string; icon: string; series: SeedSeries[] };

export const SUBJECTS: SeedSubject[] = [
  {
    key: "grammar",
    label: "문법 영상",
    icon: "📖",
    series: [
      // ================= 777 초등영문법 시리즈 (0권 ~ 6권) =================
      {
        title: "777 초등영문법",
        chapters: [
          { title: "0권", lessons: [
            { title: "01. 명사! 모든 것들의 이름" },
            { title: "02. 강아지가 한 마리면 a dog, 여러 마리면 dogs" },
            { title: "03. 명사의 복수형" },
            { title: "04. 셀 수 없는 명사" },
            { title: "05. 주격 대명사 I, We, You" },
            { title: "06. 주격 대명사 He, She, They, It" },
            { title: "07. 목적격 대명사" },
            { title: "08. 소유격 대명사" },
            { title: "09. 지시대명사" },
            { title: "10. be동사 '(~이)다'" },
            { title: "11. be동사 '(~에) 있다'" },
            { title: "12. be동사의 부정문" },
            { title: "13. be동사로 묻고 답하기" },
            { title: "14. 일반동사" },
            { title: "15. 일반동사의 부정문" }
          ]},
          { title: "1권", lessons: [
            { title: "01. 문장의 순서" },
            { title: "02. 명사! 모든 것들의 이름" },
            { title: "03. 셀 수 없는 명사" },
            { title: "04. 셀 수 있는 명사의 복수형" },
            { title: "05. 관사! 명사의 짝꿍" },
            { title: "06. 인칭대명사" },
            { title: "07. 지시대명사" },
            { title: "08. be동사" },
            { title: "09. 일반동사의 현재형" },
            { title: "10. 일반동사의 3인칭 단수형" },
            { title: "11. be동사의 부정문" },
            { title: "12. 일반동사의 부정문" },
            { title: "13. be동사로 묻고 답하기" },
            { title: "14. 일반동사로 묻고 답하기" },
            { title: "15. 의문사로 의문문 만들기" }
          ]},
          { title: "2권", lessons: [
            { title: "01. 동사를 돕는 조동사" },
            { title: "02. 할 수 있어! can" },
            { title: "03. 꼭 해야 해! must" },
            { title: "04. be동사 과거형" },
            { title: "05. 일반동사 과거형" },
            { title: "06. 꾸미고 설명하는 형용사" },
            { title: "07. 꾸미기 대장, 부사" },
            { title: "08. '해라!' 명령문" },
            { title: "09. '하지 마!' 부정 명령문" },
            { title: "10. '함께 해' 청유문" },
            { title: "11. 숫자 나타내기" },
            { title: "12. 비인칭주어 it" },
            { title: "13. 시간 묻고 답하기" },
            { title: "14. 날짜와 요일 말하기" },
            { title: "15. 가격 묻고 답하기" }
          ]},
          { title: "3권", lessons: [
            { title: "01. 명사" },
            { title: "02. 명사를 대신하는 대명사" },
            { title: "03. 영어의 8품사" },
            { title: "04. 문장의 주부와 술부" },
            { title: "05. 영어 문장의 종류" },
            { title: "06. 과거를 나타내는 문장" },
            { title: "07. 일반동사의 불규칙 과거형" },
            { title: "08. 현재진행형" },
            { title: "09. 과거진행형" },
            { title: "10. 미래시제 will과 be going to" },
            { title: "11. 형용사의 쓰임" },
            { title: "12. 2형식 문장과 감각동사" },
            { title: "13. 꾸며 주기 좋아하는 부사" },
            { title: "14. 비교급 문장" },
            { title: "15. 최상급 문장" }
          ]},
          { title: "4권", lessons: [
            { title: "01. 회화에 잘 쓰이는 조동사 Can/Could" },
            { title: "02. 회화에 잘 쓰이는 조동사 Will/Would" },
            { title: "03. 회화에 잘 쓰이는 조동사 Shall" },
            { title: "04. 회화에 잘 쓰이는 조동사 May" },
            { title: "05. 회화에 잘 쓰이는 조동사 Must/Have to" },
            { title: "06. many, much, a lot of" },
            { title: "07. (a) few, (a) little" },
            { title: "08. some, any" },
            { title: "09. 숫자 묻고 답하기" },
            { title: "10. 가격과 양, 거리 묻고 답하기" },
            { title: "11. 문장을 이어주는 접속사" },
            { title: "12. 시간의 전치사" },
            { title: "13. 장소의 전치사" },
            { title: "14. 방향의 전치사" },
            { title: "15. There is ... / There are ..." }
          ]},
          { title: "5권", lessons: [
            { title: "01. 문장의 5형식" },
            { title: "02. 2형식 문장과 감각동사" },
            { title: "03. 4형식 문장 → 3형식 문장" },
            { title: "04. 5형식 문장" },
            { title: "05. 부가의문문" },
            { title: "06. 현재분사와 과거분사" },
            { title: "07. 수동태 만들기" },
            { title: "08. 수동태의 부정문과 의문문" },
            { title: "09. 시간의 접속사 when / after / before" },
            { title: "10. 기타 접속사 because / if" },
            { title: "11. When으로 묻고 시간 전치사로 답하기" },
            { title: "12. Where로 묻고 장소 전치사로 답하기" },
            { title: "13. 접속부사와 접속사 as" },
            { title: "14. 전치사 마무리하기" },
            { title: "15. 명령문과 and / or" }
          ]},
          { title: "6권", lessons: [
            { title: "01. 현재완료시제" },
            { title: "02. 현재완료시제 용법 '완료, 계속'" },
            { title: "03. 현재완료시제 용법 '결과, 경험'" },
            { title: "04. 현재완료시제 의문문" },
            { title: "05. 현재완료시제와 과거시제의 비교" },
            { title: "06. 동명사의 역할과 동명사 만들기" },
            { title: "07. 동명사와 함께 쓰는 동사들" },
            { title: "08. to부정사의 역할과 to부정사 만들기" },
            { title: "09. to부정사의 용법 - 명사, 형용사, 부사" },
            { title: "10. to부정사와 함께 쓰는 동사들" },
            { title: "11. 관계대명사" },
            { title: "12. 관계대명사 '주격'" },
            { title: "13. 관계대명사 '목적격'" },
            { title: "14. 주의해야 할 관계대명사 용법과 what" },
            { title: "15. 관계부사" }
          ]}
        ]
      },
      // ================= 1316 중등문법1 =================
      {
        title: "1316 중등문법1",
        chapters: [
          { title: "CH01 be동사와 인칭대명사", lessons: [
            { title: "UNIT1. be동사가 있는 문장", page: "p.8" },
            { title: "UNIT2. be동사가 있는 부정문과 의문문", page: "p.10" },
            { title: "UNIT3. 인칭대명사", page: "p.12" }
          ]},
          { title: "CH02 일반동사", lessons: [
            { title: "UNIT1. 일반동사의 의미와 형태", page: "p.18" },
            { title: "UNIT2. 일반동사의 과거형", page: "p.20" },
            { title: "UNIT3. 일반동사가 있는 부정문", page: "p.22" },
            { title: "UNIT4. 일반동사가 있는 의문문", page: "p.24" }
          ]},
          { title: "CH03 명사와 관사", lessons: [
            { title: "UNIT1. 셀 수 있는 명사와 셀 수 없는 명사", page: "p.30" },
            { title: "UNIT2. 관사", page: "p.32" }
          ]},
          { title: "CH04 문장의 시제", lessons: [
            { title: "UNIT1. 현재시제와 과거시제", page: "p.38" },
            { title: "UNIT2. 진행형", page: "p.40" }
          ]},
          { title: "CH05 조동사", lessons: [
            { title: "UNIT1. will", page: "p.46" },
            { title: "UNIT2. can, may", page: "p.48" },
            { title: "UNIT3. must, should", page: "p.50" }
          ]},
          { title: "CH06 의문사가 있는 의문문", lessons: [
            { title: "UNIT1. 의문사 who, what, which", page: "p.56" },
            { title: "UNIT2. 의문사 when, where, why", page: "p.58" },
            { title: "UNIT3. 의문사 how", page: "p.60" }
          ]},
          { title: "CH07 기타 의문문 / 감탄문 / 명령문", lessons: [
            { title: "UNIT1. 부가 의문문", page: "p.66" },
            { title: "UNIT2. 부정 의문문, 선택 의문문", page: "p.68" },
            { title: "UNIT3. 감탄문", page: "p.70" },
            { title: "UNIT4. 명령문", page: "p.72" }
          ]},
          { title: "CH08 동사의 종류", lessons: [
            { title: "UNIT1. 감각동사 + 형용사", page: "p.78" },
            { title: "UNIT2. 수여동사 + 간접목적어 + 직접목적어", page: "p.80" },
            { title: "UNIT3. 동사 + 목적어 + 목적격 보어", page: "p.82" }
          ]},
          { title: "CH09 to부정사와 동명사", lessons: [
            { title: "UNIT1. to부정사의 명사적 용법", page: "p.88" },
            { title: "UNIT2. to부정사의 형용사적 용법과 부사적 용법", page: "p.90" },
            { title: "UNIT3. 동명사", page: "p.92" }
          ]},
          { title: "CH10 대명사", lessons: [
            { title: "UNIT1. 재귀대명사, this/that, 비인칭 주어 it", page: "p.98" },
            { title: "UNIT2. one, some, any", page: "p.100" }
          ]},
          { title: "CH11 형용사와 부사", lessons: [
            { title: "UNIT1. 형용사의 역할", page: "p.106" },
            { title: "UNIT2. 부사의 역할", page: "p.108" },
            { title: "UNIT3. 비교 표현", page: "p.110" }
          ]},
          { title: "CH12 전치사", lessons: [
            { title: "UNIT1. 시간의 전치사", page: "p.116" },
            { title: "UNIT2. 장소의 전치사", page: "p.118" },
            { title: "UNIT3. 기타 전치사", page: "p.120" }
          ]},
          { title: "CH13 접속사", lessons: [
            { title: "UNIT1. and, but, or, so", page: "p.126" },
            { title: "UNIT2. when, before, after, while", page: "p.128" },
            { title: "UNIT3. because, if, that", page: "p.130" }
          ]}
        ]
      }
    ]
  },
  {
    key: "reading",
    label: "독해 지문 영상",
    icon: "📗",
    series: [
      // ================= 리더스뱅크 2 =================
      {
        title: "리더스뱅크2",
        chapters: [
          { title: "Unit 01", lessons: [
            { title: "[Animals] 엄마 잃은 보금자리", page: "p.14" },
            { title: "[Tales] 흥겨운 비밀", page: "p.15" },
            { title: "[People] 챗GPT를 만든 비밀", page: "p.16" },
            { title: "[문법] -thing으로 끝나는 대명사 / -thing + 형용사", page: "p.18" }
          ]},
          { title: "Unit 02", lessons: [
            { title: "[Plants] 버섯의 왕은 바로 나!", page: "p.20" },
            { title: "[Tales] 양을 홀린 미스터리", page: "p.21" },
            { title: "[Technology] 상상 그 이상의 게임 세상", page: "p.22" },
            { title: "[문법] 부사절을 이끄는 접속사 / 감정의 원인을 나타내는 to부정사", page: "p.24" }
          ]},
          { title: "Unit 03", lessons: [
            { title: "[Culture] 파자마 파티", page: "p.26" },
            { title: "[Food] 운동할 때는 이 과일을 챙기세요", page: "p.27" },
            { title: "[Sports] 놀라운 축구의 기술", page: "p.28" },
            { title: "[문법] 명사를 수식하는 형용사절 / 형용사절의 위치", page: "p.30" }
          ]},
          { title: "Unit 04", lessons: [
            { title: "[Places] 인도의 갠지스강", page: "p.32" },
            { title: "[Technology] AI 기술의 어두운 면", page: "p.33" },
            { title: "[Tales] 새를 구하기 위한 소녀의 지혜", page: "p.34" },
            { title: "[문법] 이유의 접속사 because / 조건의 접속사 if", page: "p.36" }
          ]},
          { title: "Unit 05", lessons: [
            { title: "[Animals] 엄마 침팬지의 사랑", page: "p.38" },
            { title: "[Society] 봉사와 관련된 불편한 진실", page: "p.39" },
            { title: "[Space] 화성에 박테리아 보내기", page: "p.40" },
            { title: "[문법] 형용사의 역할 / 형용사의 비교", page: "p.42" }
          ]},
          { title: "Unit 06", lessons: [
            { title: "[Sports] 축구 선수 등번호의 숨겨진 의미", page: "p.44" },
            { title: "[Tales] 저기, 저를 좀 안내해 주세요!", page: "p.45" },
            { title: "[Animals] 폭발물을 탐지하는 동물들", page: "p.46" },
            { title: "[문법] 수여동사 / 수여동사 문장의 전환", page: "p.48" }
          ]},
          { title: "Unit 07", lessons: [
            { title: "[Weather] 한국에도 얼마 남지 않은 계절", page: "p.50" },
            { title: "[Tales] 내 기도가 할아버지에게 닿기를!", page: "p.51" },
            { title: "[Nature] 생태계 순환", page: "p.52" },
            { title: "[문법] make + 목적어 + 형용사 / keep + 목적어 + 형용사", page: "p.54" }
          ]},
          { title: "Unit 08", lessons: [
            { title: "[Technology] AI로 증명사진 만들기", page: "p.56" },
            { title: "[Culture] 파란색의 다양한 의미", page: "p.57" },
            { title: "[Friends] 새 친구를 사귀려면 도움을 요청하세요", page: "p.58" },
            { title: "[문법] 사역동사 make / 동사 help", page: "p.60" }
          ]},
          { title: "Unit 09", lessons: [
            { title: "[Tales] 누가 아메리카 대륙을 발견했다고?", page: "p.61" },
            { title: "[Society] 세계 각국의 회사 이름은 어떻게 지어졌을까?", page: "p.63" },
            { title: "[Technology] 미래의 자동차", page: "p.64" },
            { title: "[문법] ask + 목적어 + to부정사 / want + 목적어 + to부정사", page: "p.66" }
          ]},
          { title: "Unit 10", lessons: [
            { title: "[Weather] 외로운 개에게 생긴 특별한 기적", page: "p.68" },
            { title: "[Technology] 불꽃놀이 속 숫자의 정체는?", page: "p.69" },
            { title: "[Tales] 육군이 될 소년의 정체는?", page: "p.70" },
            { title: "[문법] 지각동사의 의미 / 지각동사 + 목적어 + 동사원형", page: "p.72" }
          ]},
          { title: "Unit 11", lessons: [
            { title: "[Tales] 뱀파이어의 비밀 이야기", page: "p.74" },
            { title: "[Space] 지구의 새로운 보물섬, 달", page: "p.75" },
            { title: "[Animals] 지진을 감지하는 동물들", page: "p.76" },
            { title: "[문법] 간접의문문 / 의문사가 주어인 간접의문문", page: "p.78" }
          ]},
          { title: "Unit 12", lessons: [
            { title: "[Inventions] 잠을 깨워 주는 마법의 침대", page: "p.80" },
            { title: "[People] Van Gogh와 Theo: 어려움을 이긴 형제애", page: "p.81" },
            { title: "[Education] 동영상으로 볼까, 책으로 읽을까?", page: "p.82" },
            { title: "[문법] 시간의 접속사 until / 시간의 접속사 while", page: "p.84" }
          ]}
        ]
      },
      // ================= 리더스뱅크 3 =================
      {
        title: "리더스뱅크3",
        chapters: [
          { title: "Unit 01", lessons: [
            { title: "01. 나에게 너의 모든 비밀을 말해도 돼", page: "p.14" },
            { title: "02. 학교생활이 힘들었다고?", page: "p.16" },
            { title: "03. 카멜레온 페인트", page: "p.18" }
          ]},
          { title: "Unit 02", lessons: [
            { title: "04. 새로운 왕은 누구?", page: "p.24" },
            { title: "05. 회화형 왕 완전해체!", page: "p.26" },
            { title: "06. (English Only) 사남환 우정의 아름다움", page: "p.28" }
          ]},
          { title: "Unit 03", lessons: [
            { title: "07. 우리 고양이 좀 찾아 주세요!", page: "p.34" },
            { title: "08. 열정의 채수", page: "p.36" },
            { title: "09. 도움 주고받기의 이로움", page: "p.38" }
          ]},
          { title: "Unit 04", lessons: [
            { title: "10. 처음 본 나 이야기", page: "p.44" },
            { title: "11. 숨겨진 재능을 뽐내세요!", page: "p.46" },
            { title: "12. (English Only) 미래의 반찬거리는 여기서 재배!", page: "p.48" }
          ]},
          { title: "Unit 05", lessons: [
            { title: "13. 새로운 Superhero 탄생의 일화", page: "p.54" },
            { title: "14. 자기 몸값을 알아내는 슬픔들", page: "p.56" },
            { title: "15. 사람을 하나되게 만드는 어떤 개", page: "p.58" }
          ]},
          { title: "Unit 06", lessons: [
            { title: "16. 곤충이 잃을 보는 법", page: "p.64" },
            { title: "17. 물고기 예쁘게 씻는 일?", page: "p.66" },
            { title: "18. (English Only) 고양이도 훈련이 되나요!", page: "p.68" }
          ]},
          { title: "Unit 07", lessons: [
            { title: "19. 크리스마스트리의 유래", page: "p.74" },
            { title: "20. 우리 몸의 세포 재생 주기!", page: "p.76" },
            { title: "21. \"Go Banana!\"", page: "p.78" }
          ]},
          { title: "Unit 08", lessons: [
            { title: "22. 홍수로 괴로운 곰!", page: "p.84" },
            { title: "23. 영원히 빛나는 방울꽃", page: "p.86" },
            { title: "24. (English Only) 영양이 죽지 않는 유일한 방법", page: "p.88" }
          ]},
          { title: "Unit 09", lessons: [
            { title: "25. 제로 칼로리 음료의 비밀", page: "p.94" },
            { title: "26. 위대한 영웅, 개코원숭이", page: "p.96" },
            { title: "27. 인간의 이기심, 지구의 응답", page: "p.98" }
          ]},
          { title: "Unit 10", lessons: [
            { title: "28. 엄마 동물이 지친 대처법", page: "p.104" },
            { title: "29. 별의 일생", page: "p.106" },
            { title: "30. (English Only) 가나의 장례 풍습", page: "p.108" }
          ]},
          { title: "Unit 11", lessons: [
            { title: "31. 못난이 채소들의 멋진 다짐", page: "p.114" },
            { title: "32. 수컷 물고기가 사라지고 있어!", page: "p.116" },
            { title: "33. 홍-사랑의 옹 이야기", page: "p.118" }
          ]},
          { title: "Unit 12", lessons: [
            { title: "34. 기억력 마법의 비결", page: "p.124" },
            { title: "35. (English Only) 자연 최고의 건축가, 흰개미", page: "p.126" },
            { title: "36. \"Mentor\"의 기원", page: "p.128" }
          ]}
        ]
      }
    ]
  }
];

export const STUDENTS = [
  { name: "김라이", loginId: "1001" },
  { name: "강승현", loginId: "1002" },
  { name: "김효진", loginId: "1003" },
  { name: "오지혜", loginId: "1004" },
  { name: "이시은", loginId: "1005" },
  { name: "손유찬", loginId: "1006" },
  { name: "김아영", loginId: "1007" },
  { name: "박서은", loginId: "1008" },
  { name: "양정후", loginId: "1009" },
  { name: "박승빈", loginId: "1010" },
  { name: "차유준", loginId: "1011" }
];

/** 기존 데이터를 모두 지우고 위 SUBJECTS/STUDENTS로 다시 채웁니다. */
export async function runSeed(prisma: PrismaClient) {
  await prisma.progress.deleteMany();
  await prisma.video.deleteMany();
  await prisma.chapter.deleteMany();
  await prisma.series.deleteMany();
  await prisma.subject.deleteMany();
  await prisma.student.deleteMany();

  for (const [subjectOrder, subject] of SUBJECTS.entries()) {
    await prisma.subject.create({
      data: {
        key: subject.key,
        label: subject.label,
        icon: subject.icon,
        order: subjectOrder,
        series: {
          create: subject.series.map((series, seriesOrder) => ({
            title: series.title,
            order: seriesOrder,
            chapters: {
              create: series.chapters.map((chapter, chapterOrder) => ({
                title: chapter.title,
                order: chapterOrder,
                videos: {
                  create: chapter.lessons.map((lesson, videoOrder) => ({
                    title: lesson.title,
                    page: lesson.page ?? null,
                    order: videoOrder,
                    videoUrl: lesson.url ?? "",
                    duration: lesson.duration ?? null,
                  })),
                },
              })),
            },
          })),
        },
      },
    });
  }

  const students = await Promise.all(
    STUDENTS.map((s) => prisma.student.create({ data: s }))
  );

  const lessonCounts = SUBJECTS.map((subject) => {
    const lessonCount = subject.series.reduce(
      (sum, se) => sum + se.chapters.reduce((s2, ch) => s2 + ch.lessons.length, 0),
      0
    );
    return { label: subject.label, seriesCount: subject.series.length, lessonCount };
  });

  return { subjects: lessonCounts, studentCount: students.length, studentNames: students.map((s) => s.name) };
}
