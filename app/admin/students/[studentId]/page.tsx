import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getStudentLearningHistory } from "@/lib/progress";
import { deleteProgressEntry, markVideoWatchedByAdmin } from "../../actions";

export default async function AdminStudentHistoryPage({
  params,
}: {
  params: Promise<{ studentId: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { studentId } = await params;
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) notFound();

  const [history, assignedChapters] = await Promise.all([
    getStudentLearningHistory(studentId),
    prisma.studentChapter.findMany({
      where: { studentId },
      select: {
        chapter: {
          select: {
            title: true,
            series: {
              select: { title: true, subject: { select: { icon: true, label: true } } },
            },
            videos: { orderBy: { order: "asc" }, select: { id: true, title: true } },
          },
        },
      },
    }),
  ]);

  const videoGroups = assignedChapters
    .filter((a) => a.chapter.videos.length > 0)
    .map((a) => ({
      label: `${a.chapter.series.subject.icon} ${a.chapter.series.title} · ${a.chapter.title}`,
      videos: a.chapter.videos,
    }));

  const boundMarkWatched = markVideoWatchedByAdmin.bind(null, studentId);
  const boundDeleteEntry = deleteProgressEntry.bind(null, studentId);

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

      <div className="rounded-lg border border-zinc-200 bg-zinc-50 p-3">
        <p className="mb-2 text-xs font-semibold text-zinc-600">
          ✅ 완료로 직접 표시하기 (학생이 실제로 봤는데 기록이 안 남은 경우 — 예: 새 탭
          시청 등)
        </p>
        <form action={boundMarkWatched} className="flex gap-2">
          <select
            name="videoId"
            defaultValue=""
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="" disabled>
              영상을 선택하세요
            </option>
            {videoGroups.map((g) => (
              <optgroup key={g.label} label={g.label}>
                {g.videos.map((v) => (
                  <option key={v.id} value={v.id}>
                    {v.title}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>
          <button className="shrink-0 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            완료 처리
          </button>
        </form>
        {videoGroups.length === 0 && (
          <p className="mt-1 text-xs text-zinc-400">배정된 교재가 없어요.</p>
        )}
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
                    timeZone: "Asia/Seoul",
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-2">
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700">
                완료
              </span>
              <form action={boundDeleteEntry.bind(null, h.id)}>
                <button className="text-xs text-red-500 hover:underline">삭제</button>
              </form>
            </div>
          </div>
        ))}
        {history.length === 0 && (
          <p className="text-center text-sm text-zinc-500">아직 완료한 강의가 없어요.</p>
        )}
      </div>
    </div>
  );
}
