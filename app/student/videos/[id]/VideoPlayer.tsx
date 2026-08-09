"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { markReview, markWatched } from "../../actions";

export default function VideoPlayer({
  videoId,
  videoUrl,
  title,
  durationMinutes,
  watched,
  reviewCount,
  backHref,
}: {
  videoId: string;
  videoUrl: string;
  title: string;
  durationMinutes: number | null;
  watched: boolean;
  reviewCount: number;
  backHref: string;
}) {
  const router = useRouter();
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const formRef = useRef<HTMLFormElement>(null);
  const reviewFormRef = useRef<HTMLFormElement>(null);
  const autoSubmittedRef = useRef(false);
  const reviewAutoSubmittedRef = useRef(false);
  const prevReviewCountRef = useRef(reviewCount);

  const [elapsed, setElapsed] = useState(0);
  const [isReviewing, setIsReviewing] = useState(false);
  const [reviewElapsed, setReviewElapsed] = useState(0);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // 영상 길이(분)만큼 화면에 머물러야(=끝까지 봐야) 완료/복습 기록이 남아요.
  // 길이 정보가 없는 영상은 기본 90초로 대체하니, 정확한 판정을 위해 관리자 페이지에서
  // 영상 길이(분)를 꼭 입력해주세요.
  const requiredSeconds = durationMinutes ? Math.round(durationMinutes * 60) : 90;

  // 최초 시청 타이머 (아직 완료 전일 때만 작동)
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

  const remaining = Math.max(0, requiredSeconds - elapsed);
  const canComplete = elapsed >= requiredSeconds;

  // 다 봤으면(시간 조건 충족) 학생이 따로 누르지 않아도 자동으로 완료 처리돼요.
  useEffect(() => {
    if (watched || !canComplete || autoSubmittedRef.current) return;
    autoSubmittedRef.current = true;
    formRef.current?.requestSubmit();
  }, [watched, canComplete]);

  // "복습하기"를 눌러 다시 볼 때만 작동하는 타이머. 실제로 끝까지 다시 봐야 복습 횟수가 올라가요.
  useEffect(() => {
    if (!isReviewing) return;
    const timer = setInterval(() => {
      if (!document.hidden) {
        setReviewElapsed((s) => s + 1);
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [isReviewing]);

  const remainingReview = Math.max(0, requiredSeconds - reviewElapsed);
  const canCompleteReview = reviewElapsed >= requiredSeconds;

  useEffect(() => {
    if (!isReviewing || !canCompleteReview || reviewAutoSubmittedRef.current) return;
    reviewAutoSubmittedRef.current = true;
    reviewFormRef.current?.requestSubmit();
  }, [isReviewing, canCompleteReview]);

  // 복습 기록이 실제로 저장되면(reviewCount가 늘어나면) 복습 모드를 초기화해요.
  useEffect(() => {
    if (reviewCount !== prevReviewCountRef.current) {
      prevReviewCountRef.current = reviewCount;
      setIsReviewing(false);
      setReviewElapsed(0);
      reviewAutoSubmittedRef.current = false;
    }
  }, [reviewCount]);

  function startReview() {
    setIsReviewing(true);
    setReviewElapsed(0);
    reviewAutoSubmittedRef.current = false;
  }

  function cancelReview() {
    setIsReviewing(false);
    setReviewElapsed(0);
  }

  // 전체화면 상태를 추적해서 버튼이 "들어가기/나가기"를 정확히 보여줘요.
  // (esc 키가 없는 태블릿/폰에서도 버튼만으로 전체화면을 빠져나갈 수 있도록)
  useEffect(() => {
    function handleFullscreenChange() {
      setIsFullscreen(document.fullscreenElement === iframeRef.current);
    }
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  // 다른 화면으로 이동할 때 전체화면이 남아있으면 다음 화면과 겹쳐 보일 수 있어서,
  // 이 페이지를 떠날 때 전체화면을 확실히 해제해요.
  useEffect(() => {
    return () => {
      if (document.fullscreenElement) {
        document.exitFullscreen().catch(() => {});
      }
    };
  }, []);

  // 마이박스처럼 자체 화면 전환이 있는 임베드는, 뒤로가기를 눌렀을 때 우리 화면이 아니라
  // iframe 내부의 이전 상태(예: 마이박스 파일 목록 화면)가 겹쳐서 잠깐 보일 수 있어요.
  // 히스토리에 안전장치를 하나 쌓아두고, 뒤로가기가 감지되면 무조건 목록 화면으로
  // 이동시켜서 화면이 지저분하게 겹쳐 보이는 걸 막아요.
  useEffect(() => {
    window.history.pushState({ videoGuard: true }, "", window.location.href);
    function handlePopState() {
      router.replace(backHref);
    }
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [router, backHref]);

  function handleFullscreenToggle() {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => {});
      return;
    }
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
          onClick={handleFullscreenToggle}
          className="absolute bottom-3 right-3 rounded-lg bg-black/60 px-3 py-1.5 text-xs font-semibold text-white backdrop-blur hover:bg-black/80"
        >
          {isFullscreen ? "⛶ 전체화면 나가기" : "⛶ 전체화면"}
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
            {isReviewing ? (
              <form
                ref={reviewFormRef}
                action={markReview.bind(null, videoId)}
                className="flex flex-col items-center gap-2"
              >
                <button
                  disabled={!canCompleteReview}
                  className="rounded-lg bg-indigo-600 px-5 py-2 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
                >
                  {canCompleteReview
                    ? "복습 기록하기"
                    : `복습 중... (${remainingReview}초 후 자동 기록)`}
                </button>
                <button
                  type="button"
                  onClick={cancelReview}
                  className="text-xs text-zinc-400 underline"
                >
                  복습 취소
                </button>
              </form>
            ) : (
              <button
                type="button"
                onClick={startReview}
                className="rounded-lg border border-indigo-300 px-5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50"
              >
                🔁 복습하기
              </button>
            )}
          </div>
        ) : (
          <form
            ref={formRef}
            action={markWatched.bind(null, videoId)}
            className="flex flex-col items-center gap-2"
          >
            <input type="hidden" name="watchSeconds" value={elapsed} />
            <button
              disabled={!canComplete}
              className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-zinc-300"
            >
              {canComplete ? "시청 완료로 표시하기" : `시청 완료 (${remaining}초 후 자동)`}
            </button>
            {!canComplete && (
              <p className="max-w-xs text-center text-xs text-zinc-400">
                영상을 끝까지 보면 자동으로 완료 처리돼요. 다른 탭으로 이동하면 시간이 멈춰요.
              </p>
            )}
          </form>
        )}
      </div>
    </>
  );
}
