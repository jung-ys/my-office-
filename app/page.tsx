import Link from "next/link";
import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";

export default async function LandingPage() {
  const existing = await getStudentSession();
  if (existing) {
    redirect("/student");
  }

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="flex flex-col items-center gap-3 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-indigo-600 to-violet-600 text-3xl shadow-lg">
          📚
        </div>
        <h1 className="text-xl font-bold text-zinc-900">삼성영어 셀레나 삼양캠퍼스</h1>
        <p className="text-sm text-zinc-500">보고 · 배우고 · 완료하기</p>
      </div>

      <Link
        href="/login"
        className="flex w-full max-w-sm items-center gap-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 shadow-lg transition hover:opacity-90"
      >
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white/20 text-2xl">
          🧑‍🎓
        </span>
        <span className="flex-1 text-left text-white">
          <span className="block text-lg font-bold">학생 시작하기</span>
          <span className="block text-sm text-white/80">문법 영상 · 독해 영상 보기 · 진도 확인</span>
        </span>
        <span className="text-xl text-white">→</span>
      </Link>

      <p className="max-w-xs text-center text-xs text-zinc-400">
        📱 휴대폰에서 공유 → 홈 화면에 추가 하면 앱처럼 아이콘으로 실행돼요.
      </p>

      <Link href="/admin" className="text-xs text-zinc-400 underline underline-offset-2">
        🔑 선생님용 관리 페이지
      </Link>
    </div>
  );
}
