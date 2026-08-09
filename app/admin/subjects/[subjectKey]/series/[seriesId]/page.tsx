import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createChapter, deleteChapter } from "../../../../actions";

export default async function AdminSeriesPage({
  params,
}: {
  params: Promise<{ subjectKey: string; seriesId: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { subjectKey, seriesId } = await params;
  const series = await prisma.series.findUnique({
    where: { id: seriesId },
    include: {
      subject: true,
      chapters: { orderBy: { order: "asc" }, include: { _count: { select: { videos: true } } } },
    },
  });
  if (!series || series.subject.key !== subjectKey) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Link href={`/admin/subjects/${subjectKey}`} className="text-xs text-indigo-600 underline">
          ← {series.subject.icon} {series.subject.label} 시리즈 목록
        </Link>
        <h1 className="mt-1 text-xl font-bold">📘 {series.title} — 챕터 관리</h1>
      </div>

      <div className="flex flex-col gap-2">
        {series.chapters.map((ch) => (
          <div
            key={ch.id}
            className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3"
          >
            <Link
              href={`/admin/subjects/${subjectKey}/series/${seriesId}/chapters/${ch.id}`}
              className="font-medium text-zinc-800 hover:underline"
            >
              {ch.title}{" "}
              <span className="text-xs text-zinc-400">
                (순서 {ch.order} · 영상 {ch._count.videos}개)
              </span>
            </Link>
            <div className="flex items-center gap-3 text-sm">
              <Link
                href={`/admin/subjects/${subjectKey}/series/${seriesId}/chapters/${ch.id}`}
                className="text-indigo-600 hover:underline"
              >
                영상 관리
              </Link>
              <form action={deleteChapter.bind(null, subjectKey, seriesId, ch.id)}>
                <button className="text-red-500 hover:underline">삭제</button>
              </form>
            </div>
          </div>
        ))}
        {series.chapters.length === 0 && (
          <p className="text-sm text-zinc-400">등록된 챕터가 없어요.</p>
        )}
      </div>

      <form
        action={createChapter.bind(null, subjectKey, seriesId)}
        className="flex gap-2 rounded-lg border border-dashed border-zinc-300 p-3"
      >
        <input
          name="title"
          placeholder="새 챕터 이름 (예: 7권, CH14, Unit 13)"
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <input
          name="order"
          type="number"
          placeholder="순서"
          defaultValue={series.chapters.length + 1}
          className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <button className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
          추가
        </button>
      </form>
    </div>
  );
}
