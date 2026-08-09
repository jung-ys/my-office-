import { prisma } from "./db";

export type VideoWithStatus = {
  id: string;
  title: string;
  page: string | null;
  order: number;
  videoUrl: string;
  duration: number | null;
  watched: boolean;
  reviewCount: number;
  lastWatchedAt: Date | null;
};

/** 과목(문법/독해) 하나를 key로 조회. 없으면 null. */
export async function getSubjectByKey(key: string) {
  return prisma.subject.findUnique({ where: { key } });
}

/** 챕터 하나의 영상 목록을 학생 진도와 함께 가져옵니다. */
export async function getChapterVideosWithProgress(
  chapterId: string,
  studentId: string
): Promise<VideoWithStatus[]> {
  const videos = await prisma.video.findMany({
    where: { chapterId },
    orderBy: { order: "asc" },
    include: { progress: { where: { studentId } } },
  });

  return videos.map((v) => ({
    id: v.id,
    title: v.title,
    page: v.page,
    order: v.order,
    videoUrl: v.videoUrl,
    duration: v.duration,
    watched: v.progress[0]?.watched ?? false,
    reviewCount: v.progress[0]?.reviewCount ?? 0,
    lastWatchedAt: v.progress[0]?.lastWatchedAt ?? null,
  }));
}

/** 시리즈 하나(챕터 전체)의 시청 완료/전체 강의 수를 계산합니다. */
export async function getSeriesProgressSummary(seriesId: string, studentId: string) {
  const chapters = await prisma.chapter.findMany({
    where: { seriesId },
    orderBy: { order: "asc" },
    include: { videos: { include: { progress: { where: { studentId } } } } },
  });

  let total = 0;
  let watched = 0;
  const perChapter = chapters.map((ch) => {
    let chTotal = 0;
    let chWatched = 0;
    ch.videos.forEach((v) => {
      chTotal++;
      total++;
      if (v.progress[0]?.watched) {
        chWatched++;
        watched++;
      }
    });
    return { id: ch.id, title: ch.title, order: ch.order, total: chTotal, watched: chWatched };
  });

  return { total, watched, chapters: perChapter };
}

/** 과목 하나(모든 시리즈)의 시청 완료/전체 강의 수를 계산합니다. */
export async function getSubjectProgressSummary(subjectId: string, studentId: string) {
  const series = await prisma.series.findMany({
    where: { subjectId },
    orderBy: { order: "asc" },
    include: {
      chapters: { include: { videos: { include: { progress: { where: { studentId } } } } } },
    },
  });

  let total = 0;
  let watched = 0;
  const perSeries = series.map((se) => {
    let seTotal = 0;
    let seWatched = 0;
    se.chapters.forEach((ch) => {
      ch.videos.forEach((v) => {
        seTotal++;
        total++;
        if (v.progress[0]?.watched) {
          seWatched++;
          watched++;
        }
      });
    });
    return { id: se.id, title: se.title, order: se.order, total: seTotal, watched: seWatched };
  });

  return { total, watched, series: perSeries };
}

/**
 * 학생이 이 과목에서 가장 최근에 시청한 영상을 기준으로,
 * 같은 시리즈 안에서 다음으로 이어볼 "오늘의 학습" 영상을 계산합니다.
 * 이 과목에서 시청 기록이 전혀 없으면 null을 반환합니다 (→ 시리즈 선택 안내).
 */
export async function getContinueLessonForSubject(subjectId: string, studentId: string) {
  const latest = await prisma.progress.findFirst({
    where: {
      studentId,
      watched: true,
      video: { chapter: { series: { subjectId } } },
    },
    orderBy: { lastWatchedAt: "desc" },
    include: { video: { include: { chapter: { include: { series: true } } } } },
  });

  if (!latest) return null;

  const seriesId = latest.video.chapter.series.id;
  const chapters = await prisma.chapter.findMany({
    where: { seriesId },
    orderBy: { order: "asc" },
    include: {
      videos: {
        orderBy: { order: "asc" },
        include: { progress: { where: { studentId } } },
      },
    },
  });

  for (const ch of chapters) {
    for (const v of ch.videos) {
      if (!v.progress[0]?.watched) {
        return {
          kind: "continue" as const,
          video: v,
          chapterTitle: ch.title,
          seriesTitle: latest.video.chapter.series.title,
          seriesId,
          chapterId: ch.id,
        };
      }
    }
  }
  // 시리즈를 전부 완료한 경우
  return { kind: "done" as const, seriesTitle: latest.video.chapter.series.title, seriesId };
}
