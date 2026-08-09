import { prisma } from "./db";

export type VideoWithStatus = {
  id: string;
  title: string;
  order: number;
  videoUrl: string;
  duration: number | null;
  watched: boolean;
  reviewCount: number;
  lastWatchedAt: Date | null;
};

/** 특정 교재의 영상 목록을 학생의 진도 정보와 함께 가져옵니다 (교재 내 순서대로 연결). */
export async function getTextbookVideosWithProgress(
  textbookId: string,
  studentId: string
): Promise<VideoWithStatus[]> {
  const videos = await prisma.video.findMany({
    where: { textbookId },
    orderBy: { order: "asc" },
    include: {
      progress: { where: { studentId } },
    },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    order: v.order,
    videoUrl: v.videoUrl,
    duration: v.duration,
    watched: v.progress[0]?.watched ?? false,
    reviewCount: v.progress[0]?.reviewCount ?? 0,
    lastWatchedAt: v.progress[0]?.lastWatchedAt ?? null,
  }));
}

/**
 * 학생의 "오늘의 학습" 영상을 계산합니다.
 * - 현재 선택된 교재 안에서, 순서상 가장 앞선 '아직 안 본 영상'을 반환합니다.
 * - 모두 봤다면 null을 반환합니다 (교재 완료 → 복습하거나 다음 교재 선택 안내).
 */
export async function getNextVideoForStudent(textbookId: string, studentId: string) {
  const videos = await getTextbookVideosWithProgress(textbookId, studentId);
  return videos.find((v) => !v.watched) ?? null;
}
