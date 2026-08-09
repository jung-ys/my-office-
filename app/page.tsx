import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { redirect } from "next/navigation";
import LoginBoard from "./LoginBoard";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ error?: string }>;
}) {
  const existing = await getStudentSession();
  if (existing) {
    redirect("/student");
  }

  const { error } = await searchParams;

  const students = await prisma.student.findMany({
    orderBy: { name: "asc" },
  });

  return (
    <div className="flex flex-1 flex-col items-center justify-center gap-8 px-6 py-16">
      <div className="text-center">
        <h1 className="text-2xl font-bold text-zinc-900">📚 문법영상 학습</h1>
        <p className="mt-2 text-zinc-500">내 이름을 눌러서 오늘의 학습을 시작해요</p>
      </div>

      {error && (
        <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-600">{error}</p>
      )}

      <LoginBoard
        students={students.map((s) => ({ id: s.id, name: s.name, hasPin: !!s.pin }))}
      />

      <a href="/admin" className="text-xs text-zinc-400 underline underline-offset-2">
        선생님이신가요? 관리자 페이지
      </a>
    </div>
  );
}
