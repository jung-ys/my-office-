import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { markReview, markWatched } from "../../actions";

export default async function VideoPlayerPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const student = await getStudentSession();
  if (!student) return null;

  const { id } = await params;
  const video = await prisma.video.findUnique({
    where: { id },
    include: {
      chapter: { include: { series: { include: { subject: true } } } },
      progress: { where: { studentId: student.id } },
    },
  });
  if (!video) notFound();

  const siblings = await prisma.video.findMany({
    where: { chapterId: video.chapterId },
    orderBy: { order: "asc" },
  });
  const idx = siblings.findIndex((v) => v.id === video.id);
  const prevVideo = idx > 0 ? siblings[idx - 1] : null;
  const nextVideo = idx < siblings.length - 1 ? siblings[idx + 1] : null;

  const progress = video.progress[0];
  const watched = progress?.watched ?? false;
  const hasUrl = video.videoUrl && video.videoUrl.trim() !== "";

  const chapterHref = `/student/subjects/${video.chapter.series.subject.key}/series/${video.chapter.series.id}/chapters/${video.chapter.id}`;

  return (
    <div className="flex flex-col gap-5 py-6">
      <div>
        <Link href={chapterHref} className="text-xs text-indigo-600 underline">
          ← {video.chapter.series.title} · {video.chapter.title} 목록으로
        </Link>
        <h1 className="mt-1 text-lg font-bold text-zinc-900">
          {video.title}
          {video.page && <span className="ml-2 text-xs font-normal text-zinc-400">{video.page}</span>}
        </h1>
        {video.duration && <p className="text-xs text-zinc-500">약 {video.duration}분</p>}
      </div>

      {hasUrl ? (
        <>
          <div className="overflow-hidden rounded-xl border border-zinc-200 bg-black">
            <div className="aspect-video w-full">
              <iframe
                src={video.videoUrl}
                className="h-full w-full"
                allow="autoplay; fullscreen"
                allowFullScreen
                title={video.title}
              />
            </div>
          </div>
          <p className="text-center text-xs text-zinc-400">
            영상이 안 보이면 마이박스 임베드가 막혀있을 수 있어요.{" "}
            <a
              href={video.videoUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium text-indigo-600 underline"
            >
              새 탭에서 영상 보기 →
            </a>
          </p>
        </>
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
          <p className="text-sm text-zinc-400">아직 영상 링크가 등록되지 않았어요 (준비 중)</p>
        </div>
      )}

      <div className="flex flex-col items-center gap-3">
        {watched ? (
          <div className="flex flex-col items-center gap-2">
            <p className="text-sm font-medium text-emerald-600">
              ✓ 시청 완료 {progress?.reviewCount ? `· 복습 ${progress.reviewCount}회` : ""}
            </p>
            <form action={markReview.bind(null, video.id)}>
              <button className="rounded-lg border border-indigo-300 px-5 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50">
                🔁 복습했어요
              </button>
            </form>
          </div>
        ) : (
          <form action={markWatched.bind(null, video.id)}>
            <button className="rounded-lg bg-indigo-600 px-6 py-2.5 font-semibold text-white hover:bg-indigo-700">
              시청 완료로 표시하기
            </button>
          </form>
        )}
      </div>

      <div className="mt-4 flex items-center justify-between border-t border-zinc-200 pt-4 text-sm">
        {prevVideo ? (
          <Link href={`/student/videos/${prevVideo.id}`} className="text-zinc-500 hover:text-zinc-900">
            ← 이전 강의
          </Link>
        ) : (
          <span />
        )}
        {nextVideo ? (
          <Link
            href={`/student/videos/${nextVideo.id}`}
            className="font-semibold text-indigo-600 hover:text-indigo-800"
          >
            다음 강의 →
          </Link>
        ) : (
          <Link href="/student" className="font-semibold text-indigo-600 hover:text-indigo-800">
            오늘의 학습으로 →
          </Link>
        )}
      </div>
    </div>
  );
}
