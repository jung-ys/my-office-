import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createVideo, deleteVideo, reorderVideos, updateVideo } from "../../../../../../actions";
import VideoManagerList from "./VideoManagerList";

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
  const boundReorder = reorderVideos.bind(null, subjectKey, seriesId, chapterId);

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
        {chapter.videos.length > 0 && (
          <p className="mt-1 text-xs text-zinc-400">
            ⠿ 손잡이를 눌러서 드래그하면 순서가 바뀌어요 (번호는 자동으로 다시 매겨져요)
          </p>
        )}
      </div>

      <VideoManagerList
        videos={chapter.videos.map((v) => ({
          id: v.id,
          order: v.order,
          title: v.title,
          videoUrl: v.videoUrl,
          page: v.page,
          duration: v.duration,
        }))}
        onReorder={boundReorder}
        updateAction={boundUpdate}
        deleteAction={boundDelete}
      />
      {chapter.videos.length === 0 && (
        <p className="text-sm text-zinc-400">아직 등록된 영상이 없어요.</p>
      )}

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
            name="duration"
            type="number"
            min="1"
            placeholder="길이(분) *"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            required
          />
        </div>
        <label className="text-xs text-zinc-500">
          삽입 위치
          <select
            name="insertAfterId"
            defaultValue=""
            className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          >
            <option value="">맨 뒤에 추가</option>
            {chapter.videos.map((v) => (
              <option key={v.id} value={v.id}>
                {v.order}. {v.title} 다음에 추가
              </option>
            ))}
          </select>
        </label>
        <button className="self-end rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
          추가
        </button>
      </form>
    </div>
  );
}
