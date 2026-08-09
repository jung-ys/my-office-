"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { clearStudentSession, getStudentSession } from "@/lib/auth";

export async function logoutStudent() {
  await clearStudentSession();
  redirect("/");
}

/** 영상을 시청 완료로 표시합니다. 이미 봤던 영상이면 복습 횟수를 올립니다. */
export async function markWatched(videoId: string) {
  const student = await getStudentSession();
  if (!student) redirect("/");

  const existing = await prisma.progress.findUnique({
    where: { studentId_videoId: { studentId: student.id, videoId } },
  });

  const now = new Date();

  await prisma.progress.upsert({
    where: { studentId_videoId: { studentId: student.id, videoId } },
    create: {
      studentId: student.id,
      videoId,
      watched: true,
      firstWatchedAt: now,
      lastWatchedAt: now,
    },
    update: {
      watched: true,
      lastWatchedAt: now,
      reviewCount: existing?.watched ? { increment: 1 } : undefined,
    },
  });

  revalidatePath("/student");
  revalidatePath(`/student/videos/${videoId}`);
}

/** 이미 본 영상을 복습용으로 다시 열람 기록만 남깁니다 (완료 상태 유지). */
export async function markReview(videoId: string) {
  const student = await getStudentSession();
  if (!student) redirect("/");

  await prisma.progress.update({
    where: { studentId_videoId: { studentId: student.id, videoId } },
    data: { lastWatchedAt: new Date(), reviewCount: { increment: 1 } },
  });

  revalidatePath(`/student/videos/${videoId}`);
}
