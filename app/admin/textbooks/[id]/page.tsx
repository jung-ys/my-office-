import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { createVideo, deleteVideo, updateVideo } from "../../actions";

export default async function AdminTextbookPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  if (!(await isAdmin())) {
    redirect("/admin");
  }

  const { id } = await params;
  const textbook = await prisma.textbook.findUnique({
    where: { id },
    include: { videos: { orderBy: { order: "asc" } } },
  });
  if (!textbook) notFound();

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-4 py-8">
      <div>
        <Link href="/admin" className="text-xs text-indigo-600 underline">
          ← 관리자 홈
        </Link>
        <h1 className="mt-1 text-xl font-bold">📘 {textbook.title} — 영상 관리</h1>
      </div>

      <div className="flex flex-col gap-3">
        {textbook.videos.map((v) => (
          <details
            key={v.id}
            className="rounded-lg border border-zinc-200 bg-white px-4 py-3"
          >
            <summary className="flex cursor-pointer items-center justify-between font-medium text-zinc-800">
              <span>
                {v.order}. {v.title}
              </span>
              <span className="text-xs text-zinc-400">{v.duration ? `${v.duration}분` : ""}</span>
            </summary>

            <form
              action={updateVideo.bind(null, v.id)}
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
                네이버 마이박스 공유 링크
                <input
                  name="videoUrl"
                  defaultValue={v.videoUrl}
                  className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  required
                />
              </label>
              <div className="flex gap-2">
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
                  길이(분)
                  <input
                    name="duration"
                    type="number"
                    defaultValue={v.duration ?? ""}
                    className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                  />
                </label>
              </div>
              <div className="mt-1 flex justify-end gap-3">
                <button
                  formAction={deleteVideo.bind(null, v.id)}
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
        {textbook.videos.length === 0 && (
          <p className="text-sm text-zinc-400">아직 등록된 영상이 없어요.</p>
        )}
      </div>

      <form
        action={createVideo.bind(null, textbook.id)}
        className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-4"
      >
        <p className="text-sm font-semibold text-zinc-700">➕ 새 영상 추가</p>
        <input
          name="title"
          placeholder="영상 제목 (예: 5강. 현재완료)"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <input
          name="videoUrl"
          placeholder="네이버 마이박스 공유 링크"
          className="rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          required
        />
        <div className="flex gap-2">
          <input
            name="order"
            type="number"
            placeholder="순서"
            defaultValue={textbook.videos.length + 1}
            className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="duration"
            type="number"
            placeholder="길이(분)"
            className="w-24 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button className="ml-auto rounded-lg bg-indigo-600 px-4 py-2 text-sm font-semibold text-white hover:bg-indigo-700">
            추가
          </button>
        </div>
      </form>
    </div>
  );
}
