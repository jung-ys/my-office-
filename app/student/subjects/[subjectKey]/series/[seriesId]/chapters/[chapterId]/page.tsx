import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { getChapterVideosWithProgress } from "@/lib/progress";

export default async function ChapterVideoListPage({
  params,
}: {
  params: Promise<{ subjectKey: string; seriesId: string; chapterId: string }>;
}) {
  const student = await getStudentSession();
  if (!student) return null;

  const { subjectKey, seriesId, chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      series: { include: { subject: true } },
      assignedStudents: { where: { studentId: student.id } },
    },
  });
  if (
    !chapter ||
    chapter.series.id !== seriesId ||
    chapter.series.subject.key !== subjectKey ||
    chapter.assignedStudents.length === 0
  ) {
    notFound();
  }

  const videos = await getChapterVideosWithProgress(chapterId, student.id);
  const firstUnwatchedIndex = videos.findIndex((v) => !v.watched);

  return (
    <div className="flex flex-col gap-4 py-6">
      <div>
        <Link
          href={`/student/subjects/${subjectKey}/series/${seriesId}`}
          className="text-xs text-indigo-600 underline"
        >
          ← {chapter.series.title} 챕터 목록으로
        </Link>
        <h1 className="mt-1 text-lg font-bold text-zinc-900">
          {chapter.series.title} · {chapter.title}
        </h1>
      </div>

      <ol className="relative flex flex-col">
        {videos.map((v, idx) => {
          const isToday = idx === firstUnwatchedIndex;
          return (
            <li key={v.id} className="relative flex gap-3 pb-4">
              <div
                className={`z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-bold ${
                  v.watched
                    ? "bg-emerald-500 text-white"
                    : isToday
                      ? "bg-indigo-600 text-white"
                      : "bg-zinc-200 text-zinc-500"
                }`}
              >
                {v.watched ? "✓" : idx + 1}
              </div>

              <Link
                href={`/student/videos/${v.id}`}
                className={`flex flex-1 items-center justify-between rounded-xl border px-4 py-3 shadow-sm transition ${
                  isToday
                    ? "border-indigo-300 bg-indigo-50"
                    : "border-zinc-200 bg-white hover:bg-zinc-50"
                }`}
              >
                <div>
                  <p className="font-medium text-zinc-900">
                    {v.title}
                    {v.page && <span className="ml-2 text-xs text-zinc-400">{v.page}</span>}
                  </p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {v.duration ? `약 ${v.duration}분` : ""}
                    {v.watched && v.reviewCount > 0 ? ` · 복습 ${v.reviewCount}회` : ""}
                    {!v.videoUrl && " · 준비 중"}
                  </p>
                </div>
                {isToday && (
                  <span className="shrink-0 rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                    오늘 학습
                  </span>
                )}
                {v.watched && !isToday && (
                  <span className="shrink-0 rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    완료
                  </span>
                )}
              </Link>
            </li>
          );
        })}
        {videos.length === 0 && (
          <p className="text-zinc-500">이 챕터에는 아직 등록된 영상이 없어요.</p>
        )}
      </ol>
    </div>
  );
}
