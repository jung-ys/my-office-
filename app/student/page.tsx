import Link from "next/link";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { getContinueLessonForSubject, getSubjectProgressSummary } from "@/lib/progress";

export default async function StudentDashboard() {
  const student = await getStudentSession();
  if (!student) return null;

  const subjects = await prisma.subject.findMany({ orderBy: { order: "asc" } });

  const cards = await Promise.all(
    subjects.map(async (subject) => {
      const summary = await getSubjectProgressSummary(subject.id, student.id);
      const cont = await getContinueLessonForSubject(subject.id, student.id);
      return { subject, summary, cont };
    })
  );

  return (
    <div className="flex flex-col gap-6 py-6">
      <div>
        <h1 className="text-lg font-bold text-zinc-900">{student.name}님, 안녕하세요 👋</h1>
        <p className="mt-1 text-sm text-zinc-500">오늘 학습할 과목을 선택해주세요.</p>
      </div>

      {cards.map(({ subject, summary, cont }) => {
        const percent = summary.total === 0 ? 0 : Math.round((summary.watched / summary.total) * 100);
        return (
          <section
            key={subject.id}
            className="rounded-2xl border border-zinc-200 bg-white p-5 shadow-sm"
          >
            <div className="flex items-center justify-between">
              <h2 className="text-base font-bold text-zinc-900">
                {subject.icon} {subject.label}
              </h2>
              <Link
                href={`/student/subjects/${subject.key}`}
                className="text-xs text-indigo-600 underline"
              >
                전체 목록 보기
              </Link>
            </div>

            <div className="mt-3 h-2 w-full rounded-full bg-zinc-200">
              <div
                className="h-2 rounded-full bg-indigo-500 transition-all"
                style={{ width: `${percent}%` }}
              />
            </div>
            <p className="mt-1 text-xs text-zinc-500">
              {summary.watched} / {summary.total}강 완료 ({percent}%)
            </p>

            {cont && cont.kind === "continue" ? (
              <div className="mt-4 rounded-xl bg-indigo-50 p-4">
                <p className="text-xs font-medium text-indigo-600">
                  🎯 이어보기 · {cont.seriesTitle} · {cont.chapterTitle}
                </p>
                <p className="mt-1 font-bold text-zinc-900">{cont.video.title}</p>
                <Link
                  href={`/student/videos/${cont.video.id}`}
                  className="mt-3 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  ▶ 이어서 보기
                </Link>
              </div>
            ) : cont && cont.kind === "done" ? (
              <div className="mt-4 rounded-xl bg-emerald-50 p-4">
                <p className="text-sm font-bold text-emerald-700">
                  🎉 {cont.seriesTitle} 시리즈를 모두 완료했어요!
                </p>
                <Link
                  href={`/student/subjects/${subject.key}`}
                  className="mt-2 inline-block text-sm font-semibold text-emerald-700 underline"
                >
                  다른 시리즈 둘러보기
                </Link>
              </div>
            ) : (
              <div className="mt-4 rounded-xl bg-zinc-50 p-4">
                <p className="text-sm text-zinc-600">아직 시작한 강의가 없어요.</p>
                <Link
                  href={`/student/subjects/${subject.key}`}
                  className="mt-2 inline-block rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700"
                >
                  시리즈 둘러보기
                </Link>
              </div>
            )}
          </section>
        );
      })}

      {cards.length === 0 && (
        <p className="text-center text-zinc-500">아직 등록된 과목이 없어요. 선생님께 문의해주세요.</p>
      )}
    </div>
  );
}
