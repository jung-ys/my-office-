import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createSeries, deleteSeries } from "../../actions";

export default async function AdminSubjectPage({
  params,
}: {
  params: Promise<{ subjectKey: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { subjectKey } = await params;
  const subject = await prisma.subject.findUnique({
    where: { key: subjectKey },
    include: { series: { orderBy: { order: "asc" }, include: { _count: { select: { chapters: true } } } } },
  });
  if (!subject) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Link href="/admin" className="text-xs text-indigo-600 underline">
          ← 관리자 홈
        </Link>
        <h1 className="mt-1 text-xl font-bold">
          {subject.icon} {subject.label} — 시리즈 관리
        </h1>
      </div>

      <div className="flex flex-col gap-2">
        {subject.series.map((se) => (
          <div
            key={se.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
          >
            <Link
              href={`/admin/subjects/${subjectKey}/series/${se.id}`}
              className="font-medium text-zinc-800 hover:underline"
            >
              {se.title}{" "}
              <span className="text-xs text-zinc-400">
                (순서 {se.order} · 챕터 {se._count.chapters}개)
              </span>
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={`/admin/subjects/${subjectKey}/series/${se.id}`}
                className="text-indigo-600 hover:underline"
              >
                챕터 관리
              </Link>
              <form action={deleteSeries.bind(null, subjectKey, se.id)}>
                <button className="text-red-500 hover:underline">삭제</button>
              </form>
            </div>
          </div>
        ))}
        {subject.series.length === 0 && (
          <p className="text-sm text-zinc-400">등록된 시리즈가 없어요.</p>
        )}
      </div>

      <form
        action={createSeries.bind(null, subject.id)}
        className="flex gap-2 rounded-lg border border-dashed border-zinc-300 p-3"
      >
        <input
          name="title"
          placeholder="새 시리즈 이름 (예: 리더스뱅크4)"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <input
          name="order"
          type="number"
          placeholder="순서"
          defaultValue={subject.series.length + 1}
          className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
          추가
        </button>
      </form>
    </div>
  );
}
