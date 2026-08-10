import { prisma } from "./db";

export type VideoWithStatus = {
  id: string;
  title: string;
  page: string | null;
  order: number;
  videoUrl: string;
  duration: number | null;
  watched: boolean;
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
    lastWatchedAt: v.progress[0]?.lastWatchedAt ?? null,
  }));
}

/** 시리즈 하나에서, 학생에게 배정된 챕터만의 시청 완료/전체 강의 수를 계산합니다. */
export async function getSeriesProgressSummary(seriesId: string, studentId: string) {
  const chapters = await prisma.chapter.findMany({
    where: { seriesId, assignedStudents: { some: { studentId } } },
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

/** 과목 하나에서, 학생에게 배정된 챕터만의 시청 완료/전체 강의 수를 계산합니다. */
export async function getSubjectProgressSummary(subjectId: string, studentId: string) {
  const series = await prisma.series.findMany({
    where: { subjectId, chapters: { some: { assignedStudents: { some: { studentId } } } } },
    orderBy: { order: "asc" },
    include: {
      chapters: {
        where: { assignedStudents: { some: { studentId } } },
        include: { videos: { include: { progress: { where: { studentId } } } } },
      },
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
 * 관리자 페이지에서 "학생별 현재 수준(진도)"을 한눈에 보기 위한 요약.
 * 학생마다, 과목마다 "완료 강의 수 / 전체 강의 수"를 계산해서 반환합니다.
 * (전체 커리큘럼 기준 — 배정 여부와 상관없이 지금까지 시청한 모든 기록을 보여줍니다)
 */
export async function getAllStudentsProgressOverview() {
  const subjects = await prisma.subject.findMany({
    orderBy: { order: "asc" },
    include: { series: { include: { chapters: { include: { _count: { select: { videos: true } } } } } } },
  });

  const subjectTotals = subjects.map((s) => ({
    id: s.id,
    key: s.key,
    label: s.label,
    icon: s.icon,
    total: s.series.reduce(
      (sum, se) => sum + se.chapters.reduce((s2, ch) => s2 + ch._count.videos, 0),
      0
    ),
  }));

  const students = await prisma.student.findMany({ orderBy: { name: "asc" } });

  const watched = await prisma.progress.findMany({
    where: { watched: true },
    select: {
      studentId: true,
      video: { select: { chapter: { select: { series: { select: { subjectId: true } } } } } },
    },
  });

  const countMap = new Map<string, number>();
  for (const p of watched) {
    const key = `${p.studentId}|${p.video.chapter.series.subjectId}`;
    countMap.set(key, (countMap.get(key) ?? 0) + 1);
  }

  return students.map((student) => ({
    student,
    subjects: subjectTotals.map((s) => ({
      key: s.key,
      label: s.label,
      icon: s.icon,
      watched: countMap.get(`${student.id}|${s.id}`) ?? 0,
      total: s.total,
    })),
  }));
}

/**
 * 이 과목에서 학생에게 배정된 모든 시리즈·챕터를 순서대로(시리즈 순서 → 챕터 순서 → 영상 순서)
 * 훑어서 아직 안 본 첫 영상을 "오늘의 학습"으로 계산합니다.
 * 한 책을 다 끝내면 자동으로 다음 배정된 책의 첫 영상으로 이어져요.
 * 배정된 영상이 없거나, 배정은 있지만 하나도 시청하지 않았으면 null을 반환합니다 (→ 시리즈 선택 안내).
 */
export async function getContinueLessonForSubject(subjectId: string, studentId: string) {
  const series = await prisma.series.findMany({
    where: { subjectId, chapters: { some: { assignedStudents: { some: { studentId } } } } },
    orderBy: { order: "asc" },
    include: {
      chapters: {
        where: { assignedStudents: { some: { studentId } } },
        orderBy: { order: "asc" },
        include: {
          videos: {
            orderBy: { order: "asc" },
            include: { progress: { where: { studentId } } },
          },
        },
      },
    },
  });

  let anyAssigned = false;
  let anyWatched = false;

  for (const se of series) {
    for (const ch of se.chapters) {
      for (const v of ch.videos) {
        anyAssigned = true;
        if (v.progress[0]?.watched) {
          anyWatched = true;
          continue;
        }
        return {
          kind: "continue" as const,
          video: v,
          chapterTitle: ch.title,
          seriesTitle: se.title,
          seriesId: se.id,
          chapterId: ch.id,
        };
      }
    }
  }

  if (!anyAssigned || !anyWatched) return null;

  // 배정된 시리즈를 전부 완료한 경우
  const lastSeries = series[series.length - 1];
  return { kind: "done" as const, seriesTitle: lastSeries.title, seriesId: lastSeries.id };
}

/** 한국 시간(KST) 기준 "오늘 자정"에 해당하는 시각을 Date로 반환합니다. */
function startOfTodayKST(): Date {
  const KST_OFFSET_MS = 9 * 60 * 60 * 1000;
  const kstNow = new Date(Date.now() + KST_OFFSET_MS);
  return new Date(
    Date.UTC(kstNow.getUTCFullYear(), kstNow.getUTCMonth(), kstNow.getUTCDate(), 0, 0, 0) -
      KST_OFFSET_MS
  );
}

/**
 * 관리자 페이지의 "오늘의 학습 기록"용 — 오늘(한국 시간 기준) 학생들이 실제로 시청 완료한
 * 영상 목록을 최신순으로 반환합니다. 관리자가 "시작 지점 설정"으로 일괄 완료 처리한 것은
 * 학생이 오늘 실제로 본 게 아니므로 제외해요.
 */
export async function getTodayLearningLog() {
  const logs = await prisma.progress.findMany({
    where: { watched: true, autoCompleted: false, firstWatchedAt: { gte: startOfTodayKST() } },
    orderBy: { firstWatchedAt: "desc" },
    include: {
      student: { select: { id: true, name: true } },
      video: {
        select: {
          title: true,
          chapter: {
            select: {
              title: true,
              series: {
                select: { title: true, subject: { select: { icon: true, label: true } } },
              },
            },
          },
        },
      },
    },
  });

  return logs.map((p) => ({
    id: p.id,
    studentId: p.student.id,
    studentName: p.student.name,
    subjectIcon: p.video.chapter.series.subject.icon,
    subjectLabel: p.video.chapter.series.subject.label,
    seriesTitle: p.video.chapter.series.title,
    chapterTitle: p.video.chapter.title,
    videoTitle: p.video.title,
    watchedAt: p.firstWatchedAt,
  }));
}

/** 관리자 페이지에서 학생 한 명의 전체 학습 기록(시청 완료한 영상)을 최신순으로 가져옵니다. */
export async function getStudentLearningHistory(studentId: string) {
  const logs = await prisma.progress.findMany({
    where: { studentId, watched: true },
    orderBy: { firstWatchedAt: "desc" },
    include: {
      video: {
        select: {
          title: true,
          chapter: {
            select: {
              title: true,
              series: {
                select: { title: true, subject: { select: { icon: true, label: true } } },
              },
            },
          },
        },
      },
    },
  });

  return logs.map((p) => ({
    id: p.id,
    subjectIcon: p.video.chapter.series.subject.icon,
    subjectLabel: p.video.chapter.series.subject.label,
    seriesTitle: p.video.chapter.series.title,
    chapterTitle: p.video.chapter.title,
    videoTitle: p.video.title,
    watchedAt: p.firstWatchedAt,
    autoCompleted: p.autoCompleted,
  }));
}
