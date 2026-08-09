import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import { loginAsStudent } from "./actions";

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const existing = await getStudentSession();
  if (existing) {
    redirect("/student");
  }

  const { error } = await searchParams;

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-16">
      <Link href="/" className="text-2xl">
        📚
      </Link>
      <h1 className="text-xl font-bold text-zinc-900">로그인</h1>

      <form
        action={loginAsStudent}
        className="flex w-full max-w-xs flex-col gap-3 rounded-2xl border border-zinc-200 bg-white p-6 shadow-sm"
      >
        <input
          name="loginId"
          placeholder="아이디"
          autoFocus
          autoComplete="off"
          className="rounded-lg border border-zinc-300 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none"
        />
        <input
          name="name"
          placeholder="이름"
          autoComplete="off"
          className="rounded-lg border border-zinc-300 px-4 py-3 text-sm focus:border-indigo-400 focus:outline-none"
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
