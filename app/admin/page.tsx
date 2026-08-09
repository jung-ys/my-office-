import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { adminLogin, adminLogout, createStudent, createTextbook, deleteStudent, deleteTextbook } from "./actions";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const admin = await isAdmin();
  const { error } = await searchParams;

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

  const [students, textbooks] = await Promise.all([
    prisma.student.findMany({ orderBy: { name: "asc" } }),
    prisma.textbook.findMany({
      orderBy: { order: "asc" },
      include: { _count: { select: { videos: true } } },
    }),
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

      {/* 교재 관리 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-zinc-800">📘 교재</h2>
        <div className="flex flex-col gap-2">
          {textbooks.map((t) => (
            <div
              key={t.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
            >
              <Link href={`/admin/textbooks/${t.id}`} className="font-medium text-zinc-800 hover:underline">
                {t.title}{" "}
                <span className="text-xs text-zinc-400">
                  (순서 {t.order} · 영상 {t._count.videos}개)
                </span>
              </Link>
              <div className="flex items-center gap-3 text-sm">
                <Link href={`/admin/textbooks/${t.id}`} className="text-indigo-600 hover:underline">
                  영상 관리
                </Link>
                <form action={deleteTextbook.bind(null, t.id)}>
                  <button className="text-red-500 hover:underline">삭제</button>
                </form>
              </div>
            </div>
          ))}
          {textbooks.length === 0 && <p className="text-sm text-zinc-400">등록된 교재가 없어요.</p>}
        </div>

        <form action={createTextbook} className="flex gap-2 rounded-lg border border-dashed border-zinc-300 p-3">
          <input
            name="title"
            placeholder="새 교재 이름 (예: 기초 문법 3권)"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <input
            name="order"
            type="number"
            placeholder="순서"
            defaultValue={textbooks.length + 1}
            className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
            추가
          </button>
        </form>
      </section>

      {/* 학생 관리 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-zinc-800">🧒 학생</h2>
        <div className="flex flex-col gap-2">
          {students.map((s) => (
            <div
              key={s.id}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
            >
              <span className="font-medium text-zinc-800">
                {s.name} {s.pin && <span className="text-xs text-zinc-400">(PIN 설정됨)</span>}
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
            placeholder="PIN(선택, 4자리)"
            maxLength={4}
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
            추가
          </button>
        </form>
      </section>
    </div>
  );
}
