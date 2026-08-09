import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { getSubjectByKey, getSubjectProgressSummary } from "@/lib/progress";

export default async function SubjectSeriesListPage({
  params,
}: {
  params: Promise<{ subjectKey: string }>;
}) {
  const student = await getStudentSession();
  if (!student) return null;

  const { subjectKey } = await params;
  const subject = await getSubjectByKey(subjectKey);
  if (!subject) notFound();

  const seriesList = await prisma.series.findMany({
    where: { subjectId: subject.id, assignedStudents: { some: { studentId: student.id } } },
    orderBy: { order: "asc" },
  });

  const summary = await getSubjectProgressSummary(subject.id, student.id);
  const bySeriesId = Object.fromEntries(summary.series.map((s) => [s.id, s]));

  return (
    <div className="flex flex-col gap-4 py-6">
      <div>
        <Link href="/student" className="text-xs text-indigo-600 underline">
          ← 오늘의 학습으로
        </Link>
        <h1 className="mt-1 text-lg font-bold text-zinc-900">
          {subject.icon} {subject.label}
        </h1>
        <p className="text-xs text-zinc-500">
          전체 {summary.total}강 · 완료 {summary.watched}강
        </p>
      </div>

      <div className="flex flex-col gap-3">
        {seriesList.map((se) => {
          const s = bySeriesId[se.id];
          return (
            <Link
              key={se.id}
              href={`/student/subjects/${subjectKey}/series/${se.id}`}
              className="flex items-center justify-between rounded-xl border border-zinc-200 bg-white px-5 py-4 shadow-sm hover:border-indigo-400 hover:bg-indigo-50"
            >
              <div>
                <p className="font-semibold text-zinc-900">📘 {se.title}</p>
                <p className="mt-0.5 text-xs text-zinc-500">
                  {s ? `${s.watched} / ${s.total}강 완료` : ""}
                </p>
              </div>
              <span className="text-zinc-400">›</span>
            </Link>
          );
        })}
        {seriesList.length === 0 && (
          <p className="text-zinc-500">
            아직 배정된 교재가 없어요. 선생님께 교재 배정을 요청해주세요.
          </p>
        )}
      </div>
    </div>
  );
}
