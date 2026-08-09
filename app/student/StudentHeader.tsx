import Link from "next/link";
import { logoutStudent } from "./actions";

export default function StudentHeader({ name }: { name: string }) {
  return (
    <header className="sticky top-0 z-10 border-b border-zinc-200 bg-white/90 backdrop-blur">
      <div className="mx-auto flex w-full max-w-2xl items-center justify-between px-4 py-3">
        <Link href="/student" className="font-bold text-zinc-900">
          📚 문법영상 학습
        </Link>
        <nav className="flex items-center gap-3 text-sm">
          <Link href="/student/textbooks" className="text-zinc-500 hover:text-zinc-900">
            교재 선택
          </Link>
          <span className="text-zinc-300">|</span>
          <span className="font-medium text-zinc-700">{name}님</span>
          <form action={logoutStudent}>
            <button className="text-zinc-400 hover:text-zinc-700">로그아웃</button>
          </form>
        </nav>
      </div>
    </header>
  );
}
