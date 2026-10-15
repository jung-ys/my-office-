import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createChapter, deleteChapter, updateChapter } from "../../../../actions";

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
      chapters: {
        orderBy: { order: "asc" },
        include: {
          videos: { orderBy: { order: "asc" }, select: { id: true, title: true, videoUrl: true } },
        },
      },
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
            className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
          >
            <form
              action={updateChapter.bind(null, subjectKey, seriesId, ch.id)}
              className="flex flex-wrap items-center gap-2"
            >
              <input
                name="title"
                defaultValue={ch.title}
                className="min-w-[160px] flex-1 rounded-lg border border-zinc-300 px-3 py-1.5 text-sm font-medium text-zinc-800"
                required
              />
              <label className="flex items-center gap-1 text-xs text-zinc-400">
                순서
                <input
                  name="order"
                  type="number"
                  defaultValue={ch.order}
                  className="w-16 rounded-lg border border-zinc-300 px-2 py-1.5 text-sm"
                />
              </label>
              <span className="text-xs text-zinc-400">영상 {ch.videos.length}개</span>
              <button className="rounded-lg bg-indigo-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-indigo-700">
                저장
              </button>
              <Link
                href={`/admin/subjects/${subjectKey}/series/${seriesId}/chapters/${ch.id}`}
                className="text-xs text-indigo-600 hover:underline"
              >
                영상 관리 →
              </Link>
              <button
                formAction={deleteChapter.bind(null, subjectKey, seriesId, ch.id)}
                className="text-xs text-red-500 hover:underline"
              >
                삭제
              </button>
            </form>
            {ch.videos.length > 0 && (
              <ul className="mt-2 flex flex-col gap-0.5 border-t border-zinc-100 pt-2">
                {ch.videos.map((v, idx) => (
                  <li key={v.id}>
                    <Link
                      href={`/admin/subjects/${subjectKey}/series/${seriesId}/chapters/${ch.id}?video=${v.id}`}
                      className="flex items-center gap-2 rounded px-1 py-0.5 text-xs text-zinc-500 hover:bg-indigo-50 hover:text-indigo-700"
                    >
                      <span className="w-5 shrink-0 text-center text-zinc-300">{idx + 1}</span>
                      <span className="flex-1 truncate">{v.title}</span>
                      <span className="shrink-0">{v.videoUrl ? "✅" : "⏳"}</span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
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
