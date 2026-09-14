"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/db";
import { setStudentSession } from "@/lib/auth";

/** 이름만 입력해서 로그인합니다. 같은 이름이 여러 명이면 선택 화면으로 보냅니다. */
export async function loginByName(formData: FormData) {
  const name = String(formData.get("name") ?? "").trim();

  if (!name) {
    redirect("/login?error=" + encodeURIComponent("이름을 입력해주세요."));
  }

  const matches = await prisma.student.findMany({ where: { name } });

  if (matches.length === 0) {
    redirect("/login?error=" + encodeURIComponent("등록된 이름이 아니에요. 선생님께 확인해주세요."));
  }

  if (matches.length === 1) {
    await setStudentSession(matches[0].id);
    redirect("/student");
  }

  // 동명이인이 있으면 본인을 고를 수 있는 선택 화면으로 이동
  redirect(`/login?pick=${encodeURIComponent(name)}`);
}

/** 동명이인 선택 화면에서 본인을 골랐을 때 바로 로그인시킵니다. */
export async function loginAsStudentId(studentId: string) {
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  if (!student) {
    redirect("/login?error=" + encodeURIComponent("학생을 찾을 수 없어요."));
  }
  await setStudentSession(studentId);
  redirect("/student");
}
