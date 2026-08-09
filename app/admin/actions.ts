"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { checkAdminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";

async function requireAdmin() {
  if (!(await isAdmin())) {
    redirect("/admin");
  }
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
  const pin = String(formData.get("pin") ?? "").trim();
  if (!name) return;
  if (!/^\d{4}$/.test(pin)) return;

  await prisma.student.create({ data: { name, pin } });
  revalidatePath("/admin");
}

export async function deleteStudent(studentId: string) {
  await requireAdmin();
  await prisma.student.delete({ where: { id: studentId } });
  revalidatePath("/admin");
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
