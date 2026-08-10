"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/db";
import { checkAdminPassword, clearAdminSession, isAdmin, setAdminSession } from "@/lib/auth";
import { runSeed } from "@/lib/seedData";
import { parseSeriesVolume } from "@/lib/seriesVolume";

export type StartingPointState = { ok: boolean; message: string } | null;

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
 * 학생마다 실제로 배우기 시작하는 권/과가 달라서, 관리자가 교재(시리즈)별로 "시작 지점"을
 * 지정할 수 있게 합니다. 선택한 영상보다 앞에 있는 배정된 영상들을 전부 "시청 완료"로
 * 표시해서, 학생은 시작 지점부터 이어서 보면 됩니다.
 *
 * "같은 교재"의 범위는 시리즈 제목의 권 번호로 판단해요 (예: "777 초등영문법 0~2권"은
 * 같은 교재로 묶여서 2권을 시작 지점으로 잡으면 0,1권도 함께 완료 처리됨). 권 번호가 없는
 * 시리즈(예: "1316 중등문법1")는 그 시리즈 하나만의 범위로 처리돼서, 서로 다른 교재를
 * 각각 독립적으로 여러 번 설정할 수 있어요.
 *
 * useActionState와 함께 쓰도록 (studentId로 바인딩된 뒤) prevState를 받는 형태예요 —
 * 리다이렉트하지 않고 결과 메시지를 반환해서, 저장해도 화면(아코디언)이 닫히지 않아요.
 */
export async function setStartingPoint(
  studentId: string,
  _prevState: StartingPointState,
  formData: FormData
): Promise<StartingPointState> {
  await requireAdmin();
  const startVideoId = String(formData.get("startVideoId") ?? "").trim();
  if (!startVideoId) return { ok: false, message: "시작할 영상을 선택해주세요." };

  const [student, startVideo] = await Promise.all([
    prisma.student.findUnique({ where: { id: studentId }, select: { name: true } }),
    prisma.video.findUnique({
      where: { id: startVideoId },
      select: {
        order: true,
        chapter: {
          select: {
            order: true,
            seriesId: true,
            series: { select: { title: true, order: true, subjectId: true } },
          },
        },
      },
    }),
  ]);
  if (!student || !startVideo) return { ok: false, message: "학생 또는 영상을 찾을 수 없어요." };

  const targetSeriesId = startVideo.chapter.seriesId;
  const targetSeriesTitle = startVideo.chapter.series.title;
  const subjectId = startVideo.chapter.series.subjectId;
  const chapterOrder = startVideo.chapter.order;
  const videoOrder = startVideo.order;

  // 같은 "교재 이름(가족)"에 속한, 같거나 더 낮은 권의 시리즈들만 모음
  const parsedTarget = parseSeriesVolume(targetSeriesTitle);
  const familySeriesIds = new Set<string>([targetSeriesId]);
  if (parsedTarget) {
    const subjectSeries = await prisma.series.findMany({
      where: { subjectId },
      select: { id: true, title: true },
    });
    for (const se of subjectSeries) {
      const parsed = parseSeriesVolume(se.title);
      if (parsed && parsed.base === parsedTarget.base && parsed.vol <= parsedTarget.vol) {
        familySeriesIds.add(se.id);
      }
    }
  }

  const assignedVideos = await prisma.video.findMany({
    where: {
      chapter: { seriesId: { in: [...familySeriesIds] }, assignedStudents: { some: { studentId } } },
    },
    select: {
      id: true,
      order: true,
      chapter: { select: { order: true, seriesId: true } },
    },
  });

  const priorVideoIds = assignedVideos
    .filter((v) => {
      if (v.chapter.seriesId === targetSeriesId) {
        // 같은 시리즈 안에서는 챕터 순서 → 영상 순서로 비교
        if (v.chapter.order !== chapterOrder) return v.chapter.order < chapterOrder;
        return v.order < videoOrder;
      }
      // 같은 교재의 더 낮은 권은 전부 "이전"으로 간주
      return true;
    })
    .map((v) => v.id);

  const now = new Date();
  if (priorVideoIds.length > 0) {
    await prisma.$transaction(
      priorVideoIds.map((videoId) =>
        prisma.progress.upsert({
          where: { studentId_videoId: { studentId, videoId } },
          create: {
            studentId,
            videoId,
            watched: true,
            firstWatchedAt: now,
            lastWatchedAt: now,
            autoCompleted: true,
          },
          update: { watched: true, lastWatchedAt: now, autoCompleted: true },
        })
      )
    );
  }

  revalidatePath("/admin");
  revalidatePath("/student");
  return {
    ok: true,
    message: `${targetSeriesTitle} 시작 지점을 저장했어요. (그 이전 영상 ${priorVideoIds.length}개를 시청 완료로 표시함)`,
  };
}

/**
 * 학생 정보(이름/아이디/학년/학교)는 그대로 두고, 배정 교재와 학습 진도(시청 완료 기록,
 * 시청 시간, 시작 지점으로 인한 자동 완료 처리 등)만 전부 지워서 처음 상태로 되돌립니다.
 * 테스트로 이것저것 눌러본 뒤 되돌리거나, 학생이 처음부터 다시 시작해야 할 때 사용해요.
 */
export async function resetStudentData(studentId: string) {
  await requireAdmin();
  const student = await prisma.student.findUnique({ where: { id: studentId }, select: { name: true } });
  if (!student) return;

  await prisma.$transaction([
    prisma.studentChapter.deleteMany({ where: { studentId } }),
    prisma.progress.deleteMany({ where: { studentId } }),
  ]);

  revalidatePath("/admin");
  revalidatePath("/student");
  redirect(`/admin?reset=${encodeURIComponent(student.name)}`);
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
  if (!title || !duration || duration <= 0) return;

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
  if (!title || !duration || duration <= 0) return;

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
