import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";

export default async function HistoryPage() {
  const student = await getStudentSession();
  if (!student) return null;

  const history = await prisma.progress.findMany({
    where: { studentId: student.id, watched: true },
    orderBy: { lastWatchedAt: "desc" },
    include: {
      video: {
        include: { chapter: { include: { series: { include: { subject: true } } } } },
      },
    },
  });

  return (
    <div className="flex flex-col gap-4 py-6">
      <div>
        <Link href="/student" className="text-xs text-indigo-600 underline">
          ← 오늘의 학습으로
        </Link>
        <h1 className="mt-1 text-lg font-bold text-zinc-900">🕓 나의 학습 이력</h1>
        <p className="text-xs text-zinc-500">총 {history.length}개 강의를 완료했어요</p>
      </div>

      <div className="flex flex-col gap-2">
        {history.map((p) => (
          <Link
            key={p.id}
            href={`/student/videos/${p.videoId}`}
            className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-4 py-3 shadow-sm hover:border-indigo-300 hover:bg-indigo-50"
          >
            <div>
              <p className="text-xs text-zinc-400">
                {p.video.chapter.series.subject.icon} {p.video.chapter.series.title} ·{" "}
                {p.video.chapter.title}
              </p>
              <p className="mt-0.5 font-medium text-zinc-900">{p.video.title}</p>
              <p className="mt-1 text-xs text-zinc-400">
                {p.lastWatchedAt &&
                  new Date(p.lastWatchedAt).toLocaleString("ko-KR", {
                    timeZone: "Asia/Seoul",
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
          </Link>
        ))}
        {history.length === 0 && (
          <p className="text-center text-sm text-zinc-500">
            아직 완료한 강의가 없어요. 강의를 시청하면 여기에 기록이 쌓여요!
          </p>
        )}
      </div>
    </div>
  );
}
