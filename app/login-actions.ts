"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setStudentSession } from "@/lib/auth";

export async function loginAsStudent(formData: FormData) {
  const studentId = String(formData.get("studentId") ?? "");
  const pin = String(formData.get("pin") ?? "");

  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    redirect("/?error=" + encodeURIComponent("학생을 찾을 수 없어요."));
  }

  if (student.pin) {
    if (student.pin !== pin) {
      redirect(
        `/?error=${encodeURIComponent("비밀번호(PIN)가 맞지 않아요.")}&studentId=${studentId}`
      );
    }
  }

  await setStudentSession(student.id);
  redirect("/student");
}
