import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createVideo, deleteVideo, updateVideo } from "../../../../../../actions";

export default async function AdminChapterPage({
  params,
}: {
  params: Promise<{ subjectKey: string; seriesId: string; chapterId: string }>;
}) {
  if (!(await isAdmin())) redirect("/admin");

  const { subjectKey, seriesId, chapterId } = await params;
  const chapter = await prisma.chapter.findUnique({
    where: { id: chapterId },
    include: {
      series: { include: { subject: true } },
      videos: { orderBy: { order: "asc" } },
    },
  });
  if (!chapter || chapter.series.id !== seriesId || chapter.series.subject.key !== subjectKey) {
    notFound();
  }

  const boundCreate = createVideo.bind(null, subjectKey, seriesId, chapterId);
  const boundUpdate = updateVideo.bind(null, subjectKey, seriesId, chapterId);
  const boundDelete = deleteVideo.bind(null, subjectKey, seriesId, chapterId);

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Link
          href={`/admin/subjects/${subjectKey}/series/${seriesId}`}
          className="text-xs text-indigo-600 underline"
        >
          ← {chapter.series.title} 챕터 목록
        </Link>
        <h1 className="mt-1 text-xl font-bold">
          {chapter.series.title} · {chapter.title} — 영상 관리
        </h1>
      </div>

      <div className="flex flex-col gap-3">
        {chapter.videos.map((v) => (
          <details key={v.id} className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
            <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-800">
              <span>
                {v.order}. {v.title}
              </span>
              <span className="text-xs text-zinc-400">
                {v.videoUrl ? "✅ 링크 있음" : "⏳ 준비 중"}
              </span>
            </summary>

            <form
              action={boundUpdate.bind(null, v.id)}
              className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3"
            >
              <label className="text-xs text-zinc-500">
                제목
                <input
                  name="title"
                  defaultValue={v.title}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <label className="text-xs text-zinc-500">
                영상 링크 (네이버 마이박스, 유튜브 등)
                <input
                  name="videoUrl"
                  defaultValue={v.videoUrl}
                  placeholder="비워두면 학생 화면에 '준비 중'으로 표시돼요"
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                />
              </label>
              <div className="flex gap-2">
                <label className="flex-1 text-xs text-zinc-500">
                  교재 페이지
                  <input
                    name="page"
                    defaultValue={v.page ?? ""}
                    placeholder="p.14"
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex-1 text-xs text-zinc-500">
                  순서
                  <input
                    name="order"
                    type="number"
                    defaultValue={v.order}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </label>
                <label className="flex-1 text-xs text-zinc-500">
                  길이(분) *
                  <input
                    name="duration"
                    type="number"
                    min="1"
                    defaultValue={v.duration ?? ""}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    required
                  />
                </label>
              </div>
              <div className="mt-1 flex justify-end gap-3">
                <button
                  formAction={boundDelete.bind(null, v.id)}
                  className="text-sm text-red-500 hover:underline"
                >
                  삭제
                </button>
                <button className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700">
                  저장
                </button>
              </div>
            </form>
          </details>
        ))}
        {chapter.videos.length === 0 && (
          <p className="text-sm text-zinc-400">아직 등록된 영상이 없어요.</p>
        )}
      </div>

      <form
        action={boundCreate}
        className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-4"
      >
        <p className="text-sm font-semibold text-zinc-700">➕ 새 영상 추가</p>
        <p className="text-xs text-zinc-400">
          길이(분)은 학생이 영상을 끝까지 봤는지 확인하는 기준으로 쓰이니 정확히 입력해주세요.
        </p>
        <input
          name="title"
          placeholder="영상 제목 (예: UNIT1. be동사가 있는 문장)"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <input
          name="videoUrl"
          placeholder="영상 링크 (없으면 비워두세요)"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
        />
        <div className="flex gap-2">
          <input
            name="page"
            placeholder="교재 페이지 (선택)"
            className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="order"
            type="number"
            placeholder="순서"
            defaultValue={chapter.videos.length + 1}
            className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="duration"
            type="number"
            min="1"
            placeholder="길이(분) *"
            className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <button className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            추가
          </button>
        </div>
      </form>
    </div>
  );
}
