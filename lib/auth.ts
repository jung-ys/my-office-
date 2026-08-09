import { cookies } from "next/headers";
import crypto from "crypto";
import { prisma } from "./db";

const STUDENT_COOKIE = "sid";
const ADMIN_COOKIE = "admin_token";

function adminSecretHash() {
  const password = process.env.ADMIN_PASSWORD ?? "";
  return crypto.createHash("sha256").update(password).digest("hex");
}

// ---- 학생 세션 ----

export async function getStudentSession() {
  const store = await cookies();
  const studentId = store.get(STUDENT_COOKIE)?.value;
  if (!studentId) return null;
  const student = await prisma.student.findUnique({ where: { id: studentId } });
  return student;
}

export async function setStudentSession(studentId: string) {
  const store = await cookies();
  store.set(STUDENT_COOKIE, studentId, {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30일
  });
}

export async function clearStudentSession() {
  const store = await cookies();
  store.delete(STUDENT_COOKIE);
}

// ---- 관리자 세션 ----

export async function isAdmin() {
  const store = await cookies();
  const token = store.get(ADMIN_COOKIE)?.value;
  if (!token) return false;
  return token === adminSecretHash();
}

export function checkAdminPassword(password: string) {
  return password.length > 0 && password === process.env.ADMIN_PASSWORD;
}

export async function setAdminSession() {
  const store = await cookies();
  store.set(ADMIN_COOKIE, adminSecretHash(), {
    httpOnly: true,
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 8, // 8시간
  });
}

export async function clearAdminSession() {
  const store = await cookies();
  store.delete(ADMIN_COOKIE);
}
