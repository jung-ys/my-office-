"use client";

import { useTransition } from "react";
import { runSeedAction } from "./actions";

export default function SeedButton() {
  const [pending, startTransition] = useTransition();

  function handleClick() {
    const ok = window.confirm(
      "기존 과목/시리즈/챕터/영상/학생/진도 데이터를 모두 지우고,\n실제 커리큘럼(문법+독해)과 학생 11명으로 다시 채웁니다.\n\n계속할까요?"
    );
    if (!ok) return;
    startTransition(() => {
      runSeedAction();
    });
  }

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={pending}
      className="rounded-lg bg-amber-600 px-4 py-2 text-sm font-semibold text-white hover:bg-amber-700 disabled:opacity-50"
    >
      {pending ? "넣는 중..." : "⚠️ 초기 데이터 넣기 (최초 1회)"}
    </button>
  );
}
