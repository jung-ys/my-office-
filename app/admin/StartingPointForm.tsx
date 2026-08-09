"use client";

import { useActionState } from "react";
import { setStartingPoint, type StartingPointState } from "./actions";

export default function StartingPointForm({
  studentId,
  groups,
  disabled,
}: {
  studentId: string;
  groups: { label: string; videos: { id: string; title: string }[] }[];
  disabled: boolean;
}) {
  const boundAction = setStartingPoint.bind(null, studentId);
  const [state, formAction, pending] = useActionState<StartingPointState, FormData>(
    boundAction,
    null
  );

  return (
    <form action={formAction} className="flex flex-col gap-2">
      <div className="flex gap-2">
        <select
          name="startVideoId"
          defaultValue=""
          disabled={disabled}
          className="flex-1 rounded-lg border border-zinc-300 px-3 py-2 text-sm disabled:bg-zinc-100"
        >
          <option value="" disabled>
            시작할 영상을 선택하세요
          </option>
          {groups.map((g) => (
            <optgroup key={g.label} label={g.label}>
              {g.videos.map((v) => (
                <option key={v.id} value={v.id}>
                  {v.title}
                </option>
              ))}
            </optgroup>
          ))}
        </select>
        <button
          disabled={disabled || pending}
          className="shrink-0 rounded-lg border border-indigo-300 px-3 py-2 text-sm font-semibold text-indigo-600 hover:bg-indigo-50 disabled:opacity-50"
        >
          {pending ? "저장 중..." : "시작 지점 저장"}
        </button>
      </div>
      {state && (
        <p className={`text-xs ${state.ok ? "text-emerald-600" : "text-red-500"}`}>
          {state.ok ? "✅ " : "⚠️ "}
          {state.message}
        </p>
      )}
      {disabled && (
        <p className="text-xs text-zinc-400">
          먼저 위에서 배정 교재를 체크하고 저장한 뒤에 설정할 수 있어요.
        </p>
      )}
      {!disabled && groups.length > 1 && (
        <p className="text-xs text-zinc-400">
          교재가 여러 개면 교재마다 따로 선택해서 &quot;시작 지점 저장&quot;을 여러 번
          눌러주세요.
        </p>
      )}
    </form>
  );
}
