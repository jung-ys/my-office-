"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { clearStudentSession, getStudentSession } from "@/lib/auth";

export async function logoutStudent() {
  await clearStudentSession();
  redirect("/");
}

/** 영상을 시청 완료로 표시합니다. */
export async function markWatched(videoId: string, formData: FormData) {
  const student = await getStudentSession();
  if (!student) redirect("/");

  const watchSecondsRaw = formData.get("watchSeconds");
  const watchSeconds = watchSecondsRaw ? Number(watchSecondsRaw) : null;

  const now = new Date();

  await prisma.progress.upsert({
    where: { studentId_videoId: { studentId: student.id, videoId } },
    create: {
      studentId: student.id,
      videoId,
      watched: true,
      firstWatchedAt: now,
      lastWatchedAt: now,
      watchSeconds,
    },
    update: {
      watched: true,
      lastWatchedAt: now,
      watchSeconds: watchSeconds ?? undefined,
    },
  });

  revalidatePath("/student");
  revalidatePath(`/student/videos/${videoId}`);
}
