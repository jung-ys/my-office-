"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setStudentSession } from "@/lib/auth";

export async function loginAsStudent(formData: FormData) {
  const loginId = String(formData.get("loginId") ?? "").trim();
  const name = String(formData.get("name") ?? "").trim();

  if (!loginId || !name) {
    redirect("/login?error=" + encodeURIComponent("아이디와 이름을 모두 입력해주세요."));
  }

  const student = await prisma.student.findUnique({ where: { loginId } });
  if (!student || student.name !== name) {
    redirect("/login?error=" + encodeURIComponent("아이디 또는 이름이 맞지 않아요."));
  }

  await setStudentSession(student.id);
  redirect("/student");
}
