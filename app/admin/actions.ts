"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { checkAdminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { runSeed } from "@/lib/seedData";

async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/admin");
  }
}

/**
 * 배포된 사이트의 DB가 비어있을 때(최초 1회) 실제 커리큘럼 + 학생 11명을 넣습니다.
 * ⚠️ 기존 과목/시리즈/챕터/영상/학생/진도 데이터를 전부 지우고 다시 만듭니다.
 */
export async function runSeedAction() {
  await requireAdmin();
  await runSeed(prisma);
  revalidatePath("/admin");
  redirect("/admin?seeded=1");
}

export async function adminLogin(formData: FormData) {
  const password = String(formData.get("password") ?? "");
  if (!checkAdminPassword(password)) {
    redirect("/admin?error=" + encodeURIComponent("비밀번호가 맞지 않아요."));
  }
  await setAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin");
}

// ---- 학생 관리 ----

export async function createStudent(formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const loginId = String(formData.get("loginId") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  if (!name || !loginId) return;

  await prisma.student.create({
    data: { name, loginId, grade: grade || null, school: school || null },
  });
  revalidatePath("/admin");
  redirect(`/admin?added=${encodeURIComponent(name)}`);
}

export async function updateStudent(studentId: string, formData: FormData) {
  await requireAdmin();
  const name = String(formData.get("name") ?? "").trim();
  const loginId = String(formData.get("loginId") ?? "").trim();
  const grade = String(formData.get("grade") ?? "").trim();
  const school = String(formData.get("school") ?? "").trim();
  if (!name || !loginId) return;

  // 체크된 챕터(권/유닛) = 이 학생에게 배정할 교재 범위 (체크한 것만 그대로 배정)
  const chapterIds = formData.getAll("chapterIds").map(String);

  await prisma.$transaction([
    prisma.student.update({
      where: { id: studentId },
      data: { name, loginId, grade: grade || null, school: school || null },
    }),
    prisma.studentChapter.deleteMany({
      where: { studentId, ...(chapterIds.length > 0 ? { chapterId: { notIn: chapterIds } } : {}) },
    }),
    ...chapterIds.map((chapterId) =>
      prisma.studentChapter.upsert({
        where: { studentId_chapterId: { studentId, chapterId } },
        create: { studentId, chapterId },
        update: {},
      })
    ),
  ]);
  revalidatePath("/admin");
  redirect(`/admin?updated=${encodeURIComponent(name)}`);
}

/**
 * 학생마다 실제로 배우기 시작하는 권/과가 달라서, 관리자가 "시작 지점"을 지정할 수 있게 합니다.
 * 선택한 영상보다 앞에 있는(같은 과목 안에서 시리즈 순서 → 챕터 순서 → 영상 순서 기준) 배정된 영상들을
 * 전부 "시청 완료"로 표시해서, 학생은 시작 지점부터 이어서 보면 됩니다.
 */
export async function setStartingPoint(studentId: string, formData: FormData) {
  await requireAdmin();
  const startVideoId = String(formData.get("startVideoId") ?? "").trim();
  if (!startVideoId) return;

  const [student, startVideo] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, select: { name: true } }),
    prisma.video.findUnique({
      where: { id: startVideoId },
      select: {
        order: true,
        chapter: {
          select: { order: true, series: { select: { order: true, subjectId: true } } },
        },
      },
    }),
  ]);
  if (!student || !startVideo) return;

  const { subjectId } = startVideo.chapter.series;
  const seriesOrder = startVideo.chapter.series.order;
  const chapterOrder = startVideo.chapter.order;
  const videoOrder = startVideo.order;

  const assignedVideos = await prisma.video.findMany({
    where: {
      chapter: { series: { subjectId }, assignedStudents: { some: { studentId } } },
    },
    select: {
      id: true,
      order: true,
      chapter: { select: { order: true, series: { select: { order: true } } } },
    },
  });

  const priorVideoIds = assignedVideos
    .filter((v) => {
      const so = v.chapter.series.order;
      if (so !== seriesOrder) return so < seriesOrder;
      const co = v.chapter.order;
      if (co !== chapterOrder) return co < chapterOrder;
      return v.order < videoOrder;
    })
    .map((v) => v.id);

  const now = new Date();
  if (priorVideoIds.length > 0) {
    await prisma.$transaction(
      priorVideoIds.map((videoId) =>
        prisma.progress.upsert({
          where: { studentId_videoId: { studentId, videoId } },
          create: { studentId, videoId, watched: true, firstWatchedAt: now, lastWatchedAt: now },
          update: { watched: true, lastWatchedAt: now },
        })
      )
    );
  }

  revalidatePath("/admin");
  revalidatePath("/student");
  redirect(`/admin?startset=${encodeURIComponent(student.name)}`);
}

export async function deleteStudent(studentId: string) {
  await requireAdmin();
  const student = await prisma.student.delete({ where: { id: studentId } });
  revalidatePath("/admin");
  redirect(`/admin?deleted=${encodeURIComponent(student.name)}`);
}

// ---- 시리즈 관리 ----

export async function createSeries(subjectId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  if (!title) return;

  const subject = await prisma.subject.findUnique({ where: { id: subjectId } });
  await prisma.series.create({ data: { subjectId, title, order } });
  revalidatePath(`/admin/subjects/${subject?.key}`);
}

export async function deleteSeries(subjectKey: string, seriesId: string) {
  await requireAdmin();
  await prisma.series.delete({ where: { id: seriesId } });
  revalidatePath(`/admin/subjects/${subjectKey}`);
}

// ---- 챕터 관리 ----

export async function createChapter(subjectKey: string, seriesId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  if (!title) return;

  await prisma.chapter.create({ data: { seriesId, title, order } });
  revalidatePath(`/admin/subjects/${subjectKey}/series/${seriesId}`);
}

export async function deleteChapter(subjectKey: string, seriesId: string, chapterId: string) {
  await requireAdmin();
  await prisma.chapter.delete({ where: { id: chapterId } });
  revalidatePath(`/admin/subjects/${subjectKey}/series/${seriesId}`);
}

// ---- 영상 관리 ----

export async function createVideo(
  subjectKey: string,
  seriesId: string,
  chapterId: string,
  formData: FormData
) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const page = String(formData.get("page") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const duration = durationRaw ? Number(durationRaw) : null;
  if (!title) return;

  await prisma.video.create({
    data: { chapterId, title, videoUrl, page: page || null, order, duration },
  });
  revalidatePath(`/admin/subjects/${subjectKey}/series/${seriesId}/chapters/${chapterId}`);
}

export async function updateVideo(
  subjectKey: string,
  seriesId: string,
  chapterId: string,
  videoId: string,
  formData: FormData
) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const page = String(formData.get("page") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const duration = durationRaw ? Number(durationRaw) : null;

  await prisma.video.update({
    where: { id: videoId },
    data: { title, videoUrl, page: page || null, order, duration },
  });
  revalidatePath(`/admin/subjects/${subjectKey}/series/${seriesId}/chapters/${chapterId}`);
}

export async function deleteVideo(
  subjectKey: string,
  seriesId: string,
  chapterId: string,
  videoId: string
) {
  await requireAdmin();
  await prisma.video.delete({ where: { id: videoId } });
  revalidatePath(`/admin/subjects/${subjectKey}/series/${seriesId}/chapters/${chapterId}`);
}
