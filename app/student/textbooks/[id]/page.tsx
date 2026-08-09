import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { getTextbookVideosWithProgress } from "@/lib/progress";

export default async function TextbookDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const student = await getStudentSession();
  if (!student) return null;

  const { id } = await params;
  const textbook = await prisma.textbook.findUnique({ where: { id } });
  if (!textbook) notFound();

  // 이 교재를 아직 "현재 교재"로 선택하지 않았다면 자동으로 선택 처리
  if (student.currentTextbookId !== textbook.id) {
    await prisma.student.update({
      where: { id: student.id },
      data: { currentTextbookId: textbook.id },
    });
  }

  const videos = await getTextbookVideosWithProgress(textbook.id, student.id);
  const firstUnwatchedIndex = videos.findIndex((v) => !v.watched);

  return (
    <div className="flex flex-col gap-4 py-6">
      <div>
        <Link href="/student/textbooks" className="text-xs text-indigo-600 underline">
          ← 다른 교재 선택
        </Link>
        <h1 className="mt-1 text-lg font-bold text-zinc-900">📘 {textbook.title}</h1>
      </div>

      <ol className="relative flex flex-col">
        {videos.map((v, idx) => {
          const isToday = idx === firstUnwatchedIndex;
          return (
            <li key={v.id} className="relative flex gap-3 pb-6">
              {idx < videos.length - 1 && (
                <span
                  className="absolute left-[15px] top-8 h-full w-0.5 bg-zinc-200"
                  aria-hidden
                />
              )}
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
                  <p className="font-medium text-zinc-900">{v.title}</p>
                  <p className="mt-0.5 text-xs text-zinc-400">
                    {v.duration ? `약 ${v.duration}분` : ""}
                    {v.watched && v.reviewCount > 0 ? ` · 복습 ${v.reviewCount}회` : ""}
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
          <p className="text-zinc-500">이 교재에는 아직 등록된 영상이 없어요.</p>
        )}
      </ol>
    </div>
  );
}
