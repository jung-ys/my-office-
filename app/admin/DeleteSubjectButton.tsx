"use client";

import { useTransition } from "react";
import { deleteSubject } from "./actions";

export default function DeleteSubjectButton({
  subjectId,
  subjectLabel,
}: {
  subjectId: string;
  subjectLabel: string;
}) {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(
      `"${subjectLabel}" 과목을 삭제하면 그 안의 시리즈/챕터/영상과, 학생들의 배정·진도 기록까지\n` +
        `전부 함께 지워져요. 되돌릴 수 없어요.\n\n정말 삭제할까요?`
    );
    if (!ok) return;
    startTransition(() => {
      deleteSubject(subjectId);
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="text-sm text-red-500 hover:underline disabled:opacity-50"
    >
      {pending ? "삭제 중..." : "삭제"}
    </button>
  );
}
