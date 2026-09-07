import Link from "next/link";
import { prisma } from "@/lib/db";
import { isAdmin } from "@/lib/auth";
import { getAllStudentsProgressOverview, getTodayLearningLog } from "@/lib/progress";
import { GRADE_OPTIONS } from "@/lib/grades";
import {
  adminLogin,
  adminLogout,
  createStudent,
  createSubject,
  deleteStudent,
  updateStudent,
} from "./actions";
import SeedButton from "./SeedButton";
import SeriesAssignmentGroup from "./SeriesAssignmentGroup";
import ResetStudentButton from "./ResetStudentButton";
import StartingPointForm from "./StartingPointForm";
import DeleteSubjectButton from "./DeleteSubjectButton";

export default async function AdminPage({
  searchParams,
}: {
  searchParams: Promise<{
    error?: string;
    seeded?: string;
    added?: string;
    updated?: string;
    deleted?: string;
    reset?: string;
  }>;
}) {
  const admin = await isAdmin();
  const { error, seeded, added, updated, deleted, reset } = await searchParams;

  if (!admin) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-6 px-6 py-20">
        <h1 className="text-xl font-bold">🔑 관리자 로그인</h1>
        {error && <p className="text-sm text-red-600">{error}</p>}
        <form action={adminLogin} className="flex w-full max-w-xs flex-col gap-3">
          <input
            type="password"
            name="password"
            placeholder="관리자 비밀번호"
            className="rounded-lg border border-zinc-300 px-3 py-2"
            autoFocus
          />
          <button className="rounded-lg bg-indigo-600 py-2 font-semibold text-white hover:bg-indigo-700">
            로그인
          </button>
        </form>
        <Link href="/" className="text-xs text-zinc-400 underline">
          ← 학생 로그인으로
        </Link>
      </div>
    );
  }

  const [subjects, studentOverview, assignments, todayLog] = await Promise.all([
    prisma.subject.findMany({
      orderBy: { order: "asc" },
      include: {
        series: {
          orderBy: { order: "asc" },
          include: {
            chapters: {
              orderBy: { order: "asc" },
              include: { videos: { orderBy: { order: "asc" }, select: { id: true, title: true } } },
            },
          },
        },
      },
    }),
    getAllStudentsProgressOverview(),
    prisma.studentChapter.findMany({ select: { studentId: true, chapterId: true } }),
    getTodayLearningLog(),
  ]);

  const assignedByStudent = new Map<string, Set<string>>();
  for (const a of assignments) {
    if (!assignedByStudent.has(a.studentId)) assignedByStudent.set(a.studentId, new Set());
    assignedByStudent.get(a.studentId)!.add(a.chapterId);
  }

  /** 이 학생에게 배정된 챕터를 시리즈별로 묶어서 "777초등영문법(0권, 3권) · 리더스뱅크2(전체)" 형태로 보여줌 */
  function assignmentSummary(studentId: string): string {
    const assigned = assignedByStudent.get(studentId);
    if (!assigned || assigned.size === 0) return "배정된 교재 없음";
    const parts: string[] = [];
    for (const subject of subjects) {
      for (const se of subject.series) {
        const assignedChapters = se.chapters.filter((ch) => assigned.has(ch.id));
        if (assignedChapters.length === 0) continue;
        if (assignedChapters.length === se.chapters.length) {
          parts.push(`${se.title}(전체)`);
        } else {
          parts.push(`${se.title}(${assignedChapters.map((c) => c.title).join(", ")})`);
        }
      }
    }
    return parts.join(" · ");
  }

  /** 이 학생에게 배정된 챕터들을, 시작 지점 선택창에 넣을 "챕터별 영상 목록" 형태로 묶어줌 */
  function startingPointGroups(studentId: string) {
    const assigned = assignedByStudent.get(studentId);
    const groups: { label: string; videos: { id: string; title: string }[] }[] = [];
    for (const subject of subjects) {
      for (const se of subject.series) {
        for (const ch of se.chapters) {
          if (!assigned?.has(ch.id)) continue;
          groups.push({ label: `${subject.icon} ${se.title} · ${ch.title}`, videos: ch.videos });
        }
      }
    }
    return groups;
  }

  return (
    <div className="mx-auto flex w-full max-w-3xl flex-col gap-10 px-4 py-8">
      <div className="flex items-center justify-between">
        <h1 className="text-xl font-bold">🛠 관리자 페이지</h1>
        <div className="flex items-center gap-3 text-sm">
          <Link href="/" className="text-zinc-500 underline">
            학생 로그인 화면
          </Link>
          <form action={adminLogout}>
            <button className="text-zinc-400 hover:text-zinc-700">로그아웃</button>
          </form>
        </div>
      </div>

      {seeded && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✅ 초기 데이터를 넣었어요! 아래에서 과목/시리즈/학생을 확인해보세요.
        </p>
      )}
      {added && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✅ {added}님을 학생으로 추가했어요.
        </p>
      )}
      {updated && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          ✅ {updated}님 정보를 저장했어요.
        </p>
      )}
      {deleted && (
        <p className="rounded-lg bg-zinc-100 px-4 py-3 text-sm text-zinc-600">
          🗑 {deleted}님을 삭제했어요.
        </p>
      )}
      {reset && (
        <p className="rounded-lg bg-amber-50 px-4 py-3 text-sm text-amber-700">
          🔄 {reset}님의 배정 교재와 학습 진도를 초기화했어요.
        </p>
      )}

      {/* 오늘의 학습 기록 */}
      <details className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
        <summary className="cursor-pointer font-bold text-zinc-800">
          🗓 오늘의 학습 기록 ({todayLog.length}건)
        </summary>
        <div className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3">
          {todayLog.map((h) => (
            <Link
              key={h.id}
              href={`/admin/students/${h.studentId}`}
              className="flex items-center justify-between rounded-lg border border-zinc-200 bg-white px-4 py-3 text-sm hover:border-indigo-300 hover:bg-indigo-50"
            >
              <div>
                <span className="font-medium text-zinc-800">{h.studentName}</span>
                <span className="ml-2 text-xs text-zinc-400">
                  {h.subjectIcon} {h.seriesTitle} · {h.chapterTitle} · {h.videoTitle}
                </span>
              </div>
              <span className="shrink-0 text-xs text-zinc-400">
                {h.watchedAt &&
                  new Date(h.watchedAt).toLocaleTimeString("ko-KR", {
                    timeZone: "Asia/Seoul",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
              </span>
            </Link>
          ))}
          {todayLog.length === 0 && (
            <p className="rounded-lg border border-dashed border-zinc-300 px-4 py-3 text-sm text-zinc-400">
              오늘 학습한 기록이 아직 없어요.
            </p>
          )}
        </div>
      </details>

      {/* 최초 설정: 데이터가 비어있을 때 한 번에 채우기 */}
      <section className="flex flex-col items-start gap-2 rounded-lg border border-amber-200 bg-amber-50 p-4">
        <p className="text-sm font-semibold text-amber-800">🚀 처음 배포했다면?</p>
        <p className="text-xs text-amber-700">
          아래 버튼을 누르면 실제 커리큘럼(문법/독해)과 학생 11명이 한 번에 채워집니다.
          이미 데이터가 있는 상태에서 누르면 전부 지우고 다시 채우니, 진도가 쌓인 뒤에는 누르지 마세요.
        </p>
        <SeedButton />
      </section>

      {/* 과목별 시리즈 관리 */}
      <section className="flex flex-col gap-4">
        <h2 className="font-bold text-zinc-800">📚 과목 · 강의 관리</h2>
        {subjects.map((subject) => (
          <div key={subject.id} className="rounded-lg border border-zinc-200 bg-white p-4">
            <div className="flex items-center justify-between">
              <p className="font-semibold text-zinc-800">
                {subject.icon} {subject.label}
              </p>
              <div className="flex items-center gap-3">
                <Link
                  href={`/admin/subjects/${subject.key}`}
                  className="text-sm text-indigo-600 hover:underline"
                >
                  시리즈 관리 →
                </Link>
                <DeleteSubjectButton subjectId={subject.id} subjectLabel={subject.label} />
              </div>
            </div>
            <p className="mt-1 text-xs text-zinc-400">
              시리즈 {subject.series.length}개:{" "}
              {subject.series.map((s) => s.title).join(", ") || "없음"}
            </p>
          </div>
        ))}
        {subjects.length === 0 && <p className="text-sm text-zinc-400">등록된 과목이 없어요.</p>}

        <form
          action={createSubject}
          className="flex gap-2 rounded-lg border border-dashed border-zinc-300 p-3"
        >
          <input
            name="label"
            placeholder="새 과목 이름 (예: 내신대비 영상)"
            className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            required
          />
          <input
            name="icon"
            placeholder="아이콘(선택, 예: 📝)"
            className="w-28 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <input
            name="order"
            type="number"
            placeholder="순서"
            defaultValue={subjects.length + 1}
            className="w-20 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
          />
          <button className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
            추가
          </button>
        </form>
      </section>

      {/* 학생 관리 */}
      <section className="flex flex-col gap-3">
        <h2 className="font-bold text-zinc-800">🧒 학생 관리 (아이디 · 이름 · 학년 · 학교 · 배정 교재 · 진도)</h2>
        <div className="flex flex-col gap-2">
          {studentOverview.map(({ student: s, subjects: subjProgress }) => (
            <details key={s.id} className="rounded-lg border border-zinc-200 bg-white px-4 py-3">
              <summary className="flex cursor-pointer flex-col gap-1.5">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <span className="font-medium text-zinc-800">
                    {s.name}
                    <span className="ml-2 text-xs text-zinc-400">
                      아이디 {s.loginId}
                      {s.grade ? ` · ${s.grade}` : ""}
                      {s.school ? ` · ${s.school}` : ""}
                    </span>
                  </span>
                  <span className="flex gap-2">
                    {subjProgress.map((sp) => (
                      <span
                        key={sp.key}
                        className="rounded-full bg-indigo-50 px-2 py-0.5 text-xs font-medium text-indigo-600"
                      >
                        {sp.icon} {sp.watched}/{sp.total}
                      </span>
                    ))}
                  </span>
                </div>
                <p className="text-xs text-zinc-500">📘 {assignmentSummary(s.id)}</p>
              </summary>

              <form
                id={`student-form-${s.id}`}
                action={updateStudent.bind(null, s.id)}
                className="mt-3 flex flex-col gap-2 border-t border-zinc-100 pt-3"
              >
                <div className="flex gap-2">
                  <label className="flex-1 text-xs text-zinc-500">
                    이름
                    <input
                      name="name"
                      defaultValue={s.name}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      required
                    />
                  </label>
                  <label className="flex-1 text-xs text-zinc-500">
                    아이디
                    <input
                      name="loginId"
                      defaultValue={s.loginId}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                      required
                    />
                  </label>
                </div>
                <div className="flex gap-2">
                  <label className="flex-1 text-xs text-zinc-500">
                    학년
                    <select
                      name="grade"
                      defaultValue={s.grade ?? ""}
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    >
                      <option value="">선택 안 함</option>
                      {GRADE_OPTIONS.map((g) => (
                        <option key={g} value={g}>
                          {g}
                        </option>
                      ))}
                    </select>
                  </label>
                  <label className="flex-1 text-xs text-zinc-500">
                    학교
                    <input
                      name="school"
                      defaultValue={s.school ?? ""}
                      placeholder="예: 삼양초등학교"
                      className="mt-1 w-full rounded-lg border border-zinc-300 px-3 py-2 text-sm"
                    />
                  </label>
                </div>

                <div className="mt-1 flex flex-wrap gap-3 text-xs text-zinc-500">
                  {subjProgress.map((sp) => (
                    <span key={sp.key}>
                      {sp.icon} {sp.label}: {sp.watched} / {sp.total}강
                    </span>
                  ))}
                </div>

                <div className="mt-2 rounded-lg bg-zinc-50 p-3">
                  <p className="mb-2 text-xs font-semibold text-zinc-600">
                    📘 배정 교재 — 교재명을 체크하면 전체가, 아래 권/유닛을 개별로 체크하면 그것만
                    이 학생 화면에 보여요
                  </p>
                  <div className="flex flex-col gap-3">
                    {subjects.map((subject) => (
                      <div key={subject.id}>
                        <p className="text-xs font-medium text-zinc-500">
                          {subject.icon} {subject.label}
                        </p>
                        <div className="mt-1 flex flex-col gap-2">
                          {subject.series.map((se) => (
                            <SeriesAssignmentGroup
                              key={se.id}
                              seriesTitle={se.title}
                              chapters={se.chapters.map((ch) => ({ id: ch.id, title: ch.title }))}
                              defaultCheckedIds={se.chapters
                                .filter((ch) => assignedByStudent.get(s.id)?.has(ch.id))
                                .map((ch) => ch.id)}
                            />
                          ))}
                          {subject.series.length === 0 && (
                            <span className="text-xs text-zinc-400">시리즈 없음</span>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </form>

              <div className="mt-2 rounded-lg bg-zinc-50 p-3">
                <p className="mb-2 text-xs font-semibold text-zinc-600">
                  🚩 시작 지점 설정 (교재마다 시작하는 권·과가 달라요. 실제로 시작할 영상을 고르면
                  그 이전의 배정된 영상은 전부 시청 완료로 표시돼요. 저장해도 이 화면은 닫히지
                  않으니, 교재별로 여러 번 설정할 수 있어요)
                </p>
                <StartingPointForm
                  studentId={s.id}
                  groups={startingPointGroups(s.id)}
                  disabled={(assignedByStudent.get(s.id)?.size ?? 0) === 0}
                />
              </div>

              <div className="mt-3 flex items-center justify-between gap-3 border-t border-zinc-100 pt-3">
                <div className="flex items-center gap-3">
                  <ResetStudentButton studentId={s.id} studentName={s.name} />
                  <Link
                    href={`/admin/students/${s.id}`}
                    className="text-sm text-indigo-600 hover:underline"
                  >
                    📋 학습 기록 보기
                  </Link>
                </div>
                <div className="flex gap-3">
                  <button
                    form={`student-form-${s.id}`}
                    formAction={deleteStudent.bind(null, s.id)}
                    className="text-sm text-red-500 hover:underline"
                  >
                    삭제
                  </button>
                  <button
                    form={`student-form-${s.id}`}
                    className="rounded-lg bg-indigo-600 px-4 py-1.5 text-sm font-semibold text-white hover:bg-indigo-700"
                  >
                    저장 (확인 후 여기를 눌러야 닫혀요)
                  </button>
                </div>
              </div>
            </details>
          ))}
          {studentOverview.length === 0 && (
            <p className="text-sm text-zinc-400">등록된 학생이 없어요.</p>
          )}
        </div>

        <form
          action={createStudent}
          className="flex flex-col gap-2 rounded-lg border border-dashed border-zinc-300 p-3"
        >
          <p className="text-sm font-semibold text-zinc-700">➕ 새 학생 추가</p>
          <div className="flex gap-2">
            <input
              name="name"
              placeholder="학생 이름"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              required
            />
            <input
              name="loginId"
              placeholder="아이디"
              className="w-32 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
              required
            />
          </div>
          <div className="flex gap-2">
            <select
              name="grade"
              defaultValue=""
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            >
              <option value="">학년 선택 안 함</option>
              {GRADE_OPTIONS.map((g) => (
                <option key={g} value={g}>
                  {g}
                </option>
              ))}
            </select>
            <input
              name="school"
              placeholder="학교 (선택)"
              className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm"
            />
            <button className="rounded-lg bg-indigo-600 px-4 text-sm font-semibold text-white hover:bg-indigo-700">
              추가
            </button>
          </div>
          <p className="text-xs text-zinc-400">
            추가한 뒤, 목록에서 이름을 눌러 펼치면 배정 교재를 체크할 수 있어요.
          </p>
        </form>
      </section>
    </div>
  );
}
