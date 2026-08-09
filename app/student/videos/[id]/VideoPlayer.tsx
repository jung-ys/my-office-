"use client";

import { useEffect, useRef, useState } from "react";
import { markReview, markWatched } from "../../actions";

export default function VideoPlayer({
  videoId,
  videoUrl,
  title,
  durationMinutes,
  watched,
  reviewCount,
}: {
  videoId: string;
  videoUrl: string;
  title: string;
  durationMinutes: number | null;
  watched: boolean;
  reviewCount: number;
}) {
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const [elapsed, setElapsed] = useState(0);

  // 이미 시청 완료된 영상은 타이머가 필요 없음(복습은 바로 가능)
  useEffect(() => {
    if (watched) return;
    const timer = setInterval(() => {
      // 다른 탭/창으로 이동해 있으면(document.hidden) 시간이 세어지지 않음 → 스킵 방지
      if (!document.hidden) {
        setElapsed((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [watched]);

  // 영상 길이의 80%만큼(최소 30초) 화면에 머물러야 완료 버튼이 눌려요.
  // 길이 정보가 없는 영상은 기본 90초로 대체해요.
  const requiredSeconds = durationMinutes
    ? Math.max(30, Math.round(durationMinutes * 60 * 0.8))
    : 90;
  const remaining = Math.max(0, requiredSeconds - elapsed);
  const canComplete = elapsed >= requiredSeconds;

  function handleFullscreen() {
    const el = iframeRef.current;
    if (!el) return;
    if (el.requestFullscreen) {
      el.requestFullscreen().catch(() => {
        /* 브라우저가 막은 경우 조용히 무시 */
      });
    }
  }

  return (
    <>
      <div className="relative overflow-hidden rounded-xl border border-zinc-200 bg-black">
        <div className="aspect-video w-full">
          <iframe
            ref={iframeRef}
            src={videoUrl}
            className="h-full w-full"
            allow="autoplay; fullscreen"
            allowFullScreen
            title={title}
          />
        </div>
        <button
          type="button"
          onClick={handleFullscreen}
          className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/80"
        >
          ⛶ 전체화면
        </button>
      </div>

      <p className="text-center text-xs text-zinc-400">
        영상이 안 보이면 마이박스 임베드가 막혀있을 수 있어요.{" "}
        <a
          href={videoUrl}
          target="_blank"
          rel="noopener noreferrer"
          className="font-medium text-indigo-600 underline"
        >
          새 탭에서 영상 보기 →
        </a>
      </p>

      <div className="flex flex-col items-center gap-3">
        {watched ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-emerald-600">
              ✓ 시청 완료 {reviewCount ? `· 복습 ${reviewCount}회` : ""}
            </p>
            <form action={markReview.bind(null, videoId)}>
              <button className="rounded-lg border border-indigo-300 px-5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                🔁 복습했어요
              </button>
            </form>
          </div>
        ) : (
          <form action={markWatched.bind(null, videoId)} className="flex flex-col items-center gap-2">
            <input type="hidden" name="watchSeconds" value={elapsed} />
            <button
              disabled={!canComplete}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {canComplete ? "시청 완료로 표시하기" : `시청 완료 (${remaining}초 후 가능)`}
            </button>
            {!canComplete && (
              <p className="max-w-xs text-center text-xs text-zinc-400">
                영상을 잠시 더 보면 완료 버튼이 눌려요. 다른 탭으로 이동하면 시간이 멈춰요.
              </p>
            )}
          </form>
        )}
      </div>
    </>
  );
}
