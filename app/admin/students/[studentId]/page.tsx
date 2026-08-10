import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getStudentLearningHistory } from "@/lib/progress";

export default async function AdminStudentHistoryPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { studentId } = await params;
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) notFound();

  const history = await getStudentLearningHistory(studentId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-4 px-4 py-8">
      <div>
        <Link href="/admin" className="text-xs text-indigo-600 underline">
          ← 관리자 홈
        </Link>
        <h1 className="mt-1 text-xl font-bold">
          📋 {student.name}님 학습 기록
          <span className="ml-2 text-sm font-normal text-zinc-400">
            아이디 {student.loginId}
            {student.grade ? ` · ${student.grade}` : ""}
            {student.school ? ` · ${student.school}` : ""}
          </span>
        </h1>
        <p className="mt-1 text-xs text-zinc-500">
          실제로 시청 완료한 {history.length}개 강의 (최신순 · &quot;시작 지점 설정&quot;으로
          일괄 완료 처리된 건 제외)
        </p>
      </div>

      <div className="flex flex-col gap-2">
        {history.map((h) => (
          <div
            key={h.id}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm"
          >
            <div>
              <p className="text-xs text-zinc-400">
                {h.subjectIcon} {h.seriesTitle} · {h.chapterTitle}
              </p>
              <p className="mt-0.5 font-medium text-zinc-900">{h.videoTitle}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {h.watchedAt &&
                  new Date(h.watchedAt).toLocaleString("ko-KR", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            </div>
            <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
              완료
            </span>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-center text-sm text-zinc-500">아직 완료한 강의가 없어요.</p>
        )}
      </div>
    </div>
  );
}
