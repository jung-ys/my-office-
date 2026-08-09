"use client";

import { useTransition } from "react";
import { resetStudentData } from "./actions";

export default function ResetStudentButton({
  studentId,
  studentName,
}: {
  studentId: string;
  studentName: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(
      `${studentName}님의 배정 교재와 학습 진도(시청 완료 기록)를 모두 지웁니다.\n` +
        `이름/아이디/학년/학교 같은 기본 정보는 그대로 남아요.\n\n계속할까요?`
    );
    if (!ok) return;
    startTransition(() => {
      resetStudentData(studentId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-amber-600 hover:underline disabled:opacity-50"
    >
      {pending ? "초기화 중..." : "🔄 배정/진도 초기화"}
    </button>
  );
}
