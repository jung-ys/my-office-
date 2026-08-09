import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { getNextVideoForStudent, getTextbookVideosWithProgress } from "@/lib/progress";

export default async function StudentDashboard() {
  const student = await getStudentSession();
  if (!student) return null;

  if (!student.currentTextbookId) {
    const textbooks = await prisma.textbook.findMany({ orderBy: { order: "asc" } });
    return (
      <div className="flex flex-col items-center gap-6 py-10 text-center">
        <h1 className="text-xl font-bold">먼저 학습할 교재를 선택해주세요</h1>
        <div className="flex w-full flex-col gap-3">
          {textbooks.map((t) => (
            <Link
              key={t.id}
              href={`/student/textbooks/${t.id}`}
              className="rounded-xl border border-zinc-200 bg-white px-5 py-4 text-left font-semibold text-zinc-800 shadow-sm hover:border-indigo-400 hover:bg-indigo-50"
            >
              📘 {t.title}
            </Link>
          ))}
          {textbooks.length === 0 && (
            <p className="text-zinc-500">아직 등록된 교재가 없어요. 선생님께 문의해주세요.</p>
          )}
        </div>
      </div>
    );
  }

  const textbook = await prisma.textbook.findUnique({
    where: { id: student.currentTextbookId },
  });

  if (!textbook) {
    return (
      <p className="text-center text-zinc-500">
        선택한 교재를 찾을 수 없어요.{" "}
        <Link href="/student/textbooks" className="text-indigo-600 underline">
          교재 다시 선택하기
        </Link>
      </p>
    );
  }

  const [nextVideo, allVideos] = await Promise.all([
    getNextVideoForStudent(textbook.id, student.id),
    getTextbookVideosWithProgress(textbook.id, student.id),
  ]);

  const watchedCount = allVideos.filter((v) => v.watched).length;
  const total = allVideos.length;
  const percent = total === 0 ? 0 : Math.round((watchedCount / total) * 100);

  return (
    <div className="flex flex-col gap-8 py-6">
      <section>
        <p className="text-sm text-zinc-500">현재 교재</p>
        <div className="mt-1 flex items-center justify-between">
          <h1 className="text-lg font-bold text-zinc-900">📘 {textbook.title}</h1>
          <Link href="/student/textbooks" className="text-xs text-indigo-600 underline">
            교재 변경
          </Link>
        </div>
        <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
          <div
            className="h-2 rounded-full bg-indigo-500 transition-all"
            style={{ width: `${percent}%` }}
          />
        </div>
        <p className="mt-1 text-xs text-zinc-500">
          {watchedCount} / {total}강 완료 ({percent}%)
        </p>
      </section>

      {nextVideo ? (
        <section className="rounded-2xl border border-indigo-200 bg-indigo-50 p-6">
          <p className="text-sm font-medium text-indigo-600">🎯 오늘의 학습</p>
          <h2 className="mt-1 text-xl font-bold text-zinc-900">{nextVideo.title}</h2>
          {nextVideo.duration && (
            <p className="mt-1 text-sm text-zinc-500">약 {nextVideo.duration}분</p>
          )}
          <Link
            href={`/student/videos/${nextVideo.id}`}
            className="mt-4 inline-block rounded-lg bg-indigo-600 px-5 py-2.5 font-semibold text-white hover:bg-indigo-700"
          >
            ▶ 오늘의 영상 보기
          </Link>
        </section>
      ) : (
        <section className="rounded-2xl border border-emerald-200 bg-emerald-50 p-6 text-center">
          <p className="text-lg font-bold text-emerald-700">🎉 이 교재를 모두 완료했어요!</p>
          <p className="mt-1 text-sm text-emerald-600">
            복습하거나 다음 교재를 선택해보세요.
          </p>
          <div className="mt-4 flex justify-center gap-3">
            <Link
              href={`/student/textbooks/${textbook.id}`}
              className="rounded-lg border border-emerald-400 px-4 py-2 text-sm font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              복습하러 가기
            </Link>
            <Link
              href="/student/textbooks"
              className="rounded-lg bg-emerald-600 px-4 py-2 text-sm font-semibold text-white hover:bg-emerald-700"
            >
              다른 교재 선택
            </Link>
          </div>
        </section>
      )}
    </div>
  );
}
