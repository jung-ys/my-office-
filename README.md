# 📚 삼성영어 셀레나 삼양캠퍼스 — 문법·독해 영상 학습 사이트

학원 문법·독해 영상(네이버 마이박스 등에 올려둔 강의)을 학생별 진도에 맞춰 자동으로
이어서 보여주는 사이트입니다. 학생은 이름 + 4자리 비밀번호로 입장하고,
**과목(문법 영상 / 독해 지문 영상) → 시리즈(교재) → 챕터 → 강의** 순서로 찾아보며
학습합니다. 이미 본 영상은 완료 표시가 되고, 과목별로 "이어보기"가 자동 추천됩니다.

## 주요 기능

- **로그인**: 학생이 이름 버튼을 누르고 4자리 비밀번호(PIN)를 입력해 입장
- **과목 구분**: 문법 영상 / 독해 지문 영상 두 카테고리로 분리
- **시리즈 → 챕터 → 강의 구조**: 예) 문법 영상 → "1316 중등문법1" → "CH01 be동사와 인칭대명사" → "UNIT1. be동사가 있는 문장"
- **자동 이어보기**: 과목별로 학생이 가장 최근에 학습한 시리즈를 기준으로 다음 안 본 강의를 대시보드에 추천
- **시청 완료 표시 / 복습**: 완료 버튼으로 진도 저장, 이미 본 영상은 "복습했어요" 버튼으로 복습 기록 남김
- **관리자 페이지** (`/admin`, 비밀번호 보호): 시리즈/챕터/영상 추가·수정·삭제, 학생(이름+PIN) 관리, 영상 링크 등록

## 영상 연동 방식 (중요)

영상 파일을 직접 저장하지 않고, **네이버 마이박스(또는 유튜브 등) 공유 링크**를
각 영상에 연결해 iframe으로 재생을 시도합니다.

1. 네이버 마이박스에서 영상 파일 우클릭 → **공유** → **링크 만들기**
2. 공유 링크를 복사해 관리자 페이지(`/admin` → 과목 → 시리즈 → 챕터 → 영상 관리)의
   "영상 링크" 칸에 붙여넣기

> ⚠️ 마이박스 공유 페이지가 iframe 삽입을 막아둔 경우 영상이 바로 재생되지 않을 수 있어,
> 영상 페이지에는 항상 **"새 탭에서 영상 보기"** 링크가 함께 표시됩니다.

## 시작하기 (로컬 개발)

이 프로젝트는 **Postgres**를 사용합니다 (아래 "배포하기" 참고). 로컬에서 먼저 써보려면
무료 Postgres를 하나 만들어서(Vercel Postgres, [Neon](https://neon.tech), [Supabase](https://supabase.com) 등
아무 곳이나 무료 티어면 충분해요) 연결 문자열을 `.env`에 넣어주세요.

```bash
npm install
cp .env.example .env      # DATABASE_URL / ADMIN_PASSWORD 채우기
npx prisma migrate dev --name init   # 테이블 생성 (최초 1회, DB 스키마가 없을 때)
npm run db:seed           # 실제 커리큘럼(777초등문법, 1316중등문법1, 리더스뱅크2·3) + 학생 11명 시드
npm run dev
```

브라우저에서 http://localhost:3000 접속 → 학생 로그인 화면
관리자 페이지는 http://localhost:3000/admin (`.env`의 `ADMIN_PASSWORD`로 로그인)

### 시드에 들어있는 학생 비밀번호 (예시 — 꼭 바꿔서 쓰세요)

`prisma/seed.ts` 상단 `STUDENTS` 배열에 학생별 PIN이 들어있습니다.
실제 운영 전에 `npm run db:seed` 전에 원하는 번호로 수정하거나, `/admin`에서
학생을 지우고 새로 등록해서 원하는 PIN으로 바꿀 수 있습니다.

### 데이터 초기화

```bash
npm run db:reset
```

## 기술 스택

- Next.js (App Router) + TypeScript + Tailwind CSS
- Prisma + Postgres (Vercel Postgres / Neon / Supabase 등 아무 호스팅 Postgres나 가능)
- 인증: 쿠키 기반 세션 (학생: 이름 + PIN, 관리자: 비밀번호)

## 배포하기 (Vercel)

1. **GitHub 저장소 연결**: [vercel.com](https://vercel.com) 로그인 → **Add New → Project** →
   이 저장소(`jung-ys/my-office-`) 선택 → 브랜치는 `claude/new-academy-project-k1jdgr`
   (또는 main에 병합했다면 main) 선택
2. **Postgres 만들기**: 프로젝트 생성 화면(또는 생성 후 **Storage** 탭)에서
   **Create Database → Postgres** 선택. 만들면 `DATABASE_URL`류 환경변수가 자동으로 추가돼요.
3. **환경변수 확인**: `DATABASE_URL`은 Neon 연동 시 자동으로 추가됩니다 (별도로 손댈 필요 없음).
   **Settings → Environment Variables**에서 **`ADMIN_PASSWORD`** 만 원하는 값으로 추가해주세요.
4. **Deploy** 클릭. 빌드 중 `prisma migrate deploy`가 자동 실행되어 테이블이 만들어집니다.
5. **초기 데이터 넣기 (최초 1회)**: 배포된 DB는 비어있으니, 내 컴퓨터에서 아래처럼
   방금 만든 Postgres에 시드를 한 번 넣어주세요.
   ```bash
   DATABASE_URL="<Vercel에서 복사한 DATABASE_URL 값>" npx tsx prisma/seed.ts
   ```
6. 완료되면 `https://프로젝트이름.vercel.app` 링크가 생깁니다. 이 링크를 학생들에게 공유하면 됩니다.

> ⚠️ 로컬에서 `npm run dev`로 스키마를 처음 만들 때는 `npx prisma migrate dev --name init`으로
> 마이그레이션 파일을 만들고 커밋해두어야, Vercel 배포 시 `prisma migrate deploy`가 그 파일을
> 그대로 실행해서 운영 DB에 테이블을 만듭니다.

- `ADMIN_PASSWORD`는 반드시 기본값에서 변경해서 사용하세요.
- 학원 내부 PC에서 서버를 계속 켜두는 방식으로만 쓰고 싶다면, 로컬 Postgres(Docker 등)를
  하나 띄워서 `DATABASE_URL`을 거기로 향하게 하고 `npm run start`로 계속 실행하면 됩니다.

## 데이터 구조

```
Subject(과목: 문법 영상 / 독해 지문 영상)
 └ Series(시리즈: 777 초등영문법, 1316 중등문법1, 리더스뱅크2, 리더스뱅크3 ...)
    └ Chapter(챕터: 0권~6권 / CH01~13 / Unit 01~12)
       └ Video(강의: 제목, 페이지, 영상 링크, 길이)

Student(학생: 이름 + PIN) ─ Progress(시청 여부, 복습 횟수) ─ Video
```

## 폴더 구조 요약

```
prisma/schema.prisma        데이터 모델 (Subject, Series, Chapter, Video, Student, Progress)
prisma/seed.ts               실제 커리큘럼 데이터 시드 스크립트
lib/db.ts                    Prisma client
lib/auth.ts                  학생/관리자 세션(쿠키) 처리
lib/progress.ts              진도 계산(과목별 이어보기, 시리즈/챕터 요약)
app/page.tsx                 학생 로그인 화면 (이름 + PIN)
app/student/                 학생용 화면 (대시보드, 과목→시리즈→챕터→강의, 영상 재생)
app/admin/                   관리자 화면 (과목→시리즈→챕터→영상, 학생 관리)
```
