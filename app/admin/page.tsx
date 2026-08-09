import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { adminLogin, adminLogout, createStudent, deleteStudent } from "./actions";
import SeedButton from "./SeedButton";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; seeded?: string }>;
}) {
  const admin = await isAdmin();
  const { error, seeded } = await searchParams;

  if (!admin) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20">
        <h1 className="text-xl font-bold">🔑 관리자 로그인</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form action={adminLogin} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="관리자 비밀번호"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            autoFocus
          />
          <button className="rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700">
            로그인
          </button>
        </form>
        <Link href="/" className="text-xs text-zinc-400 underline">
          ← 학생 로그인으로
        </Link>
      </div>
    );
  }

  const [subjects, students] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: { series: { include: { _count: { select: { chapters: true } } } } },
    }),
    prisma.student.findMany({ orderBy: { name: "asc" } }),
  ]);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🛠 관리자 페이지</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-zinc-500 underline">
            학생 로그인 화면
          </Link>
          <form action={adminLogout}>
            <button className="text-zinc-400 hover:text-zinc-700">로그아웃</button>
          </form>
        </div>
      </div>

      {seeded && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✅ 초기 데이터를 넣었어요! 아래에서 과목/시리즈/학생을 확인해보세요.
        </p>
      )}

      {/* 최초 설정: 데이터가 비어있을 때 한 번에 채우기 */}
      <section className="flex flex-col items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-800">🚀 처음 배포했다면?</p>
        <p className="text-xs text-amber-700">
          아래 버튼을 누르면 실제 커리큘럼(문법/독해)과 학생 11명이 한 번에 채워집니다.
          이미 데이터가 있는 상태에서 누르면 전부 지우고 다시 채우니, 진도가 쌓인 뒤에는 누르지 마세요.
        </p>
        <SeedButton />
      </section>

      {/* 과목별 시리즈 관리 */}
      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-zinc-800">📚 과목 · 강의 관리</h2>
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-zinc-800">
                {subject.icon} {subject.label}
              </p>
              <Link
                href={`/admin/subjects/${subject.key}`}
                className="text-sm text-indigo-600 hover:underline"
              >
                시리즈 관리 →
              </Link>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              시리즈 {subject.series.length}개:{" "}
              {subject.series.map((s) => s.title).join(", ") || "없음"}
            </p>
          </div>
        ))}
        {subjects.length === 0 && <p className="text-sm text-zinc-400">등록된 과목이 없어요.</p>}
      </section>

      {/* 학생 관리 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-zinc-800">🧒 학생 (이름 + 비밀번호 4자리)</h2>
        <div className="flex flex-col gap-2">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
            >
              <span className="font-medium text-zinc-800">
                {s.name} <span className="text-xs text-zinc-400">(PIN {s.pin})</span>
              </span>
              <form action={deleteStudent.bind(null, s.id)}>
                <button className="text-sm text-red-500 hover:underline">삭제</button>
              </form>
            </div>
          ))}
          {students.length === 0 && <p className="text-sm text-zinc-400">등록된 학생이 없어요.</p>}
        </div>

        <form action={createStudent} className="flex gap-2 rounded-lg border border-dashed border-zinc-300 p-3">
          <input
            name="name"
            placeholder="학생 이름"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <input
            name="pin"
            placeholder="비밀번호 4자리"
            maxLength={4}
            inputMode="numeric"
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <button className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
            추가
          </button>
        </form>
      </section>
    </div>
  );
}
