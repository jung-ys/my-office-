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
    include: { subject: true },
  });
  if (!series || series.subject.key !== subjectKey) notFound();

  const chapters = await prisma.chapter.findMany({
    where: { seriesId, assignedStudents: { some: { studentId: student.id } } },
    orderBy: { order: "asc" },
  });
  if (chapters.length === 0) notFound();

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
            <div
              key={ch.id}
              className="overflow-hidden rounded-xl border border-zinc-200 bg-white shadow-sm"
            >
              <Link
                href={`/student/subjects/${subjectKey}/series/${seriesId}/chapters/${ch.id}`}
                className="flex items-center justify-between px-5 py-4 hover:bg-indigo-50"
              >
                <div>
                  <p className="font-semibold text-zinc-900">{ch.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-500">
                    {c ? `${c.watched} / ${c.total}강 완료` : ""}
                  </p>
                </div>
                <span className="text-zinc-400">›</span>
              </Link>
              {c && c.videos.length > 0 && (
                <ul className="flex flex-col divide-y divide-zinc-100 border-t border-zinc-100 bg-zinc-50/60">
                  {c.videos.map((v, idx) => (
                    <li key={v.id}>
                      <Link
                        href={`/student/videos/${v.id}`}
                        className="flex items-center gap-2.5 px-5 py-2.5 text-sm hover:bg-indigo-50"
                      >
                        <span
                          className={`flex h-5 w-5 shrink-0 items-center justify-center rounded-full text-[10px] font-bold ${
                            v.watched
                              ? "bg-emerald-500 text-white"
                              : "bg-zinc-200 text-zinc-500"
                          }`}
                        >
                          {v.watched ? "✓" : idx + 1}
                        </span>
                        <span className={v.watched ? "text-zinc-500" : "text-zinc-700"}>
                          {v.title}
                        </span>
                      </Link>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
        {chapters.length === 0 && (
          <p className="text-zinc-500">아직 등록된 챕터가 없어요.</p>
        )}
      </div>
    </div>
  );
}
