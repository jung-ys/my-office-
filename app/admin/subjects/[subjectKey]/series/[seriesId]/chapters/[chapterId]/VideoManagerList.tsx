"use client";

import { useRef, useState, useTransition } from "react";

type VideoData = {
  id: string;
  order: number;
  title: string;
  videoUrl: string;
  page: string | null;
  duration: number | null;
};

/**
 * 실제 영상 목록(제목·링크·페이지·길이 수정 포함) 그 자체를 드래그로 옮길 수 있게 만든
 * 목록. 별도의 요약 목록을 안 만들고, 진짜 목차 하나로 정렬과 편집을 같이 해요.
 * ⠿ 손잡이만 드래그되고, 나머지 영역은 기존처럼 눌러서 펼치고 수정할 수 있어요.
 */
export default function VideoManagerList({
  videos: initialVideos,
  onReorder,
  updateAction,
  deleteAction,
}: {
  videos: VideoData[];
  onReorder: (orderedVideoIds: string[]) => void;
  updateAction: (videoId: string, formData: FormData) => void;
  deleteAction: (videoId: string) => void;
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [syncedInitialVideos, setSyncedInitialVideos] = useState(initialVideos);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const itemRefs = useRef(new Map<string, HTMLDetailsElement>());

  // 서버에서 새로 내려온 목록(추가/삭제 등)으로 동기화. 드래그 중에는 건드리지 않음
  if (draggingId === null && initialVideos !== syncedInitialVideos) {
    setSyncedInitialVideos(initialVideos);
    setVideos(initialVideos);
  }

  function computeTargetIndex(clientY: number, excludeId: string): number {
    const others = videos.filter((v) => v.id !== excludeId);
    for (let i = 0; i < others.length; i++) {
      const el = itemRefs.current.get(others[i].id);
      if (!el) continue;
      const rect = el.getBoundingClientRect();
      const mid = rect.top + rect.height / 2;
      if (clientY < mid) return i;
    }
    return others.length;
  }

  function handlePointerDown(e: React.PointerEvent, id: string) {
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
    setDraggingId(id);
  }

  function handlePointerMove(e: React.PointerEvent, id: string) {
    if (draggingId !== id) return;
    const idx = computeTargetIndex(e.clientY, id);
    setVideos((prev) => {
      const dragged = prev.find((v) => v.id === id);
      if (!dragged) return prev;
      const without = prev.filter((v) => v.id !== id);
      return [...without.slice(0, idx), dragged, ...without.slice(idx)];
    });
  }

  function handlePointerUp(id: string) {
    if (draggingId !== id) return;
    setDraggingId(null);
    startTransition(() => {
      onReorder(videos.map((v) => v.id));
    });
  }

  return (
    <div className="flex flex-col gap-3">
      {videos.map((v, idx) => (
        <details
          key={v.id}
          ref={(el) => {
            if (el) itemRefs.current.set(v.id, el);
            else itemRefs.current.delete(v.id);
          }}
          className={`rounded-lg border bg-white px-4 py-3 transition-shadow ${
            draggingId === v.id ? "border-indigo-300 shadow-md" : "border-zinc-200"
          } ${isPending ? "opacity-60" : ""}`}
        >
          <summary className="flex cursor-pointer items-center gap-2 font-medium text-zinc-800">
            <span
              onPointerDown={(e) => handlePointerDown(e, v.id)}
              onPointerMove={(e) => handlePointerMove(e, v.id)}
              onPointerUp={() => handlePointerUp(v.id)}
              onPointerCancel={() => handlePointerUp(v.id)}
              onClick={(e) => e.preventDefault()}
              style={{ touchAction: "none" }}
              className="cursor-grab select-none px-1 text-zinc-300 active:cursor-grabbing"
              title="드래그해서 순서 변경"
            >
              ⠿
            </span>
            <span className="flex-1">
              {idx + 1}. {v.title}
            </span>
            <span className="shrink-0 text-xs text-zinc-400">
              {v.videoUrl ? "✅ 링크 있음" : "⏳ 준비 중"}
            </span>
          </summary>

          <form
            action={updateAction.bind(null, v.id)}
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
            <p className="text-xs text-zinc-400">
              순서를 바꾸고 싶으면 위의 ⠿ 손잡이를 드래그해주세요.
            </p>
            <div className="mt-1 flex justify-end gap-3">
              <button
                type="button"
                onClick={() => startTransition(() => deleteAction(v.id))}
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
    </div>
  );
}
