"use client";

import { useRef, useState, useTransition } from "react";

type VideoItem = { id: string; title: string; hasUrl: boolean };

/**
 * 영상 목록을 드래그(마우스/터치 모두 지원)로 옮겨서 순서를 바꿀 수 있는 목록.
 * 놓으면 화면에 보이는 순서 그대로 서버에 저장돼서, 뒤 영상들의 번호가 자동으로 밀려요.
 */
export default function VideoOrderList({
  videos: initialVideos,
  onReorder,
}: {
  videos: VideoItem[];
  onReorder: (orderedVideoIds: string[]) => void;
}) {
  const [videos, setVideos] = useState(initialVideos);
  const [syncedInitialVideos, setSyncedInitialVideos] = useState(initialVideos);
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [isPending, startTransition] = useTransition();
  const itemRefs = useRef(new Map<string, HTMLLIElement>());

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
    <ol className="flex flex-col gap-1.5">
      {videos.map((v, idx) => (
        <li
          key={v.id}
          ref={(el) => {
            if (el) itemRefs.current.set(v.id, el);
            else itemRefs.current.delete(v.id);
          }}
          className={`flex items-center gap-2 rounded-lg border bg-white px-3 py-2 text-sm transition-shadow ${
            draggingId === v.id
              ? "border-indigo-300 shadow-md"
              : "border-zinc-200"
          } ${isPending ? "opacity-60" : ""}`}
        >
          <span
            onPointerDown={(e) => handlePointerDown(e, v.id)}
            onPointerMove={(e) => handlePointerMove(e, v.id)}
            onPointerUp={() => handlePointerUp(v.id)}
            onPointerCancel={() => handlePointerUp(v.id)}
            style={{ touchAction: "none" }}
            className="cursor-grab select-none px-1 text-zinc-300 active:cursor-grabbing"
            title="드래그해서 순서 변경"
          >
            ⠿
          </span>
          <span className="w-6 shrink-0 text-center text-xs font-semibold text-zinc-400">
            {idx + 1}
          </span>
          <span className="flex-1 truncate text-zinc-800">{v.title}</span>
          <span className="shrink-0 text-xs text-zinc-400">
            {v.hasUrl ? "✅" : "⏳"}
          </span>
        </li>
      ))}
    </ol>
  );
}
