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
  const formRef = useRef<HTMLFormElement>(null);
  const autoSubmittedRef = useRef(false);
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);

  // 이미 시청 완료된 영상은 타이머가 필요 없음(복습은 바로 가능)
  useEffect(() => {
    if (watched) return;
    const timer = setInterval(() => {
      // 다른 탭/창으로 이동해 있거나(document.hidden) 직접 일시정지했으면 시간이 세어지지 않음
      if (!document.hidden && !paused) {
        setElapsed((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [watched, paused]);

  // 영상 길이의 90%만큼(최소 30초) 화면에 머물러야 완료 처리돼요.
  // 길이 정보가 없는 영상은 기본 90초로 대체해요.
  const requiredSeconds = durationMinutes
    ? Math.max(30, Math.round(durationMinutes * 60 * 0.9))
    : 90;
  const remaining = Math.max(0, requiredSeconds - elapsed);
  const canComplete = elapsed >= requiredSeconds;

  // 다 봤으면(시간 조건 충족) 학생이 따로 누르지 않아도 자동으로 완료 처리돼요.
  useEffect(() => {
    if (watched || !canComplete || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    formRef.current?.requestSubmit();
  }, [watched, canComplete]);

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
          <form
            ref={formRef}
            action={markWatched.bind(null, videoId)}
            className="flex flex-col items-center gap-2"
          >
            <input type="hidden" name="watchSeconds" value={elapsed} />
            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setPaused((p) => !p)}
                className="rounded-lg border border-zinc-300 px-4 py-2.5 text-sm font-semibold text-zinc-600 hover:bg-zinc-50"
              >
                {paused ? "▶ 계속하기" : "⏸ 일시정지"}
              </button>
              <button
                disabled={!canComplete}
                className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
              >
                {canComplete ? "시청 완료로 표시하기" : `시청 완료 (${remaining}초 후 자동)`}
              </button>
            </div>
            {paused ? (
              <p className="max-w-xs text-center text-xs font-medium text-amber-600">
                ⏸ 일시정지됐어요. 다시 보기 시작하면 계속하기를 눌러주세요.
              </p>
            ) : (
              !canComplete && (
                <p className="max-w-xs text-center text-xs text-zinc-400">
                  영상을 잠시 더 보면 자동으로 완료 처리돼요. 수업이 중단되면 일시정지를 눌러주세요.
                </p>
              )
            )}
          </form>
        )}
      </div>
    </>
  );
}
