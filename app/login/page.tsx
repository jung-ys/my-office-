import Link from "next/link";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { loginAsStudentId, loginByName } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; pick?: string }>;
}) {
  const existing = await getStudentSession();
  if (existing) {
    redirect("/student");
  }

  const { error, pick } = await searchParams;

  // 동명이인이 있으면, 본인을 고를 수 있게 목록을 보여줌
  if (pick) {
    const candidates = await prisma.student.findMany({ where: { name: pick } });

    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
        <Link href="/" className="text-2xl">
          📚
        </Link>
        <h1 className="text-xl font-bold text-zinc-900">같은 이름이 여러 명이에요</h1>
        <p className="-mt-4 text-sm text-zinc-500">본인을 찾아서 눌러주세요</p>

        <div className="flex w-full max-w-xs flex-col gap-2">
          {candidates.map((s) => (
            <form key={s.id} action={loginAsStudentId.bind(null, s.id)}>
              <button className="w-full rounded-xl border border-zinc-200 bg-white px-4 py-3 text-left shadow-sm hover:border-indigo-300 hover:bg-indigo-50">
                <span className="font-semibold text-zinc-900">{s.name}</span>
                <span className="ml-2 text-xs text-zinc-400">
                  {s.grade ? s.grade : ""}
                  {s.school ? ` · ${s.school}` : ""}
                </span>
              </button>
            </form>
          ))}
        </div>

        <Link href="/login" className="text-xs text-zinc-400 underline underline-offset-2">
          ← 다시 이름 입력하기
        </Link>
      </div>
    );
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <Link href="/" className="text-2xl">
        📚
      </Link>
      <h1 className="text-xl font-bold text-zinc-900">로그인</h1>

      <form
        action={loginByName}
        className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <input
          name="name"
          placeholder="이름"
          autoFocus
          autoComplete="off"
          className="rounded-lg border border-zinc-300 px-4 py-3 text-center text-lg focus:border-indigo-400 focus:outline-none"
        />
        {error && <p className="text-center text-sm text-red-600">{error}</p>}
        <button className="mt-1 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 py-3 font-semibold text-white hover:opacity-90">
          로그인
        </button>
      </form>

      <Link href="/" className="text-xs text-zinc-400 underline underline-offset-2">
        ← 처음으로
      </Link>
    </div>
  );
}
