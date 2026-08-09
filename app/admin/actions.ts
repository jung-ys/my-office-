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

  await prisma.student.create({
    data: { name, pin: pin || null },
  });
  revalidatePath("/admin");
}

export async function deleteStudent(studentId: string) {
  await requireAdmin();
  await prisma.student.delete({ where: { id: studentId } });
  revalidatePath("/admin");
}

// ---- 교재 관리 ----

export async function createTextbook(formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  if (!title) return;

  await prisma.textbook.create({ data: { title, order } });
  revalidatePath("/admin");
}

export async function deleteTextbook(textbookId: string) {
  await requireAdmin();
  await prisma.textbook.delete({ where: { id: textbookId } });
  revalidatePath("/admin");
}

// ---- 영상 관리 ----

export async function createVideo(textbookId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const duration = durationRaw ? Number(durationRaw) : null;
  if (!title || !videoUrl) return;

  await prisma.video.create({
    data: { textbookId, title, videoUrl, order, duration },
  });
  revalidatePath(`/admin/textbooks/${textbookId}`);
}

export async function updateVideo(videoId: string, formData: FormData) {
  await requireAdmin();
  const title = String(formData.get("title") ?? "").trim();
  const videoUrl = String(formData.get("videoUrl") ?? "").trim();
  const order = Number(formData.get("order") ?? 0) || 0;
  const durationRaw = String(formData.get("duration") ?? "").trim();
  const duration = durationRaw ? Number(durationRaw) : null;

  const video = await prisma.video.update({
    where: { id: videoId },
    data: { title, videoUrl, order, duration },
  });
  revalidatePath(`/admin/textbooks/${video.textbookId}`);
}

export async function deleteVideo(videoId: string) {
  await requireAdmin();
  const video = await prisma.video.delete({ where: { id: videoId } });
  revalidatePath(`/admin/textbooks/${video.textbookId}`);
}
