import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { getSeriesProgressSummary } from "@/lib/progress";

export default async function SeriesChapterListPage({
  params,
}: {
  params: Promise<{ subjectKey: string; seriesId: string }>;
}) {
  const student = await getStudentSession();
  if (!student) return null;

  const { subjectKey, seriesId } = await params;
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    include: {
      subject: true,
      assignedStudents: { where: { studentId: student.id } },
    },
  });
  if (!series || series.subject.key !== subjectKey || series.assignedStudents.length === 0) {
    notFound();
  }

  const chapters = await prisma.chapter.findMany({
    where: { seriesId },
    orderBy: { order: "asc" },
  });

  const summary = await getSeriesProgressSummary(seriesId, student.id);
  const byChapterId = Object.fromEntries(summary.chapters.map((c) => [c.id, c]));

  return (
    <div className="flex flex-col gap-4 py-6">
      <div>
        <Link href={`/student/subjects/${subjectKey}`} className="text-xs text-indigo-600 underline">
          ← {series.subject.icon} {series.subject.label} 목록으로
        </Link>
        <h1 className="mt-1 text-lg font-bold text-zinc-900">📘 {series.title}</h1>
        <p className="text-xs text-zinc-500">
          전체 {summary.total}강 · 완료 {summary.watched}강
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {chapters.map((ch) => {
          const c = byChapterId[ch.id];
          return (
            <Link
              key={ch.id}
              href={`/student/subjects/${subjectKey}/series/${seriesId}/chapters/${ch.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm hover:border-indigo-400 hover:bg-indigo-50"
            >
              <div>
                <p className="font-semibold text-zinc-900">{ch.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {c ? `${c.watched} / ${c.total}강 완료` : ""}
                </p>
              </div>
              <span className="text-zinc-400">›</span>
            </Link>
          );
        })}
        {chapters.length === 0 && (
          <p className="text-zinc-500">아직 등록된 챕터가 없어요.</p>
        )}
      </div>
    </div>
  );
}
