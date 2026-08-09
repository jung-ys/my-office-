import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import VideoPlayer from "./VideoPlayer";

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
      chapter: {
        include: {
          series: {
            include: {
              subject: true,
              assignedStudents: { where: { studentId: student.id } },
            },
          },
        },
      },
      progress: { where: { studentId: student.id } },
    },
  });
  if (!video || video.chapter.series.assignedStudents.length === 0) notFound();

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
        <VideoPlayer
          videoId={video.id}
          videoUrl={video.videoUrl}
          title={video.title}
          durationMinutes={video.duration}
          watched={watched}
          reviewCount={progress?.reviewCount ?? 0}
        />
      ) : (
        <div className="flex aspect-video w-full items-center justify-center rounded-xl border border-dashed border-zinc-300 bg-zinc-50">
          <p className="text-sm text-zinc-400">아직 영상 링크가 등록되지 않았어요 (준비 중)</p>
        </div>
      )}

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
