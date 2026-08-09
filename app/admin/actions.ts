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

  // 체크된 챕터(권/유닛) = 이 학생에게 배정할 교재 범위
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
