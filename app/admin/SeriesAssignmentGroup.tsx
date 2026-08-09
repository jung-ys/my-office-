"use client";

import { useEffect, useRef, useState } from "react";

/**
 * 시리즈(교재) 하나를 통째로 체크하면 그 안의 모든 챕터(권/유닛)가 한 번에 체크되고,
 * 개별 챕터를 체크/해제하면 시리즈 체크박스가 자동으로 전체/일부/해제 상태로 반영돼요.
 * 실제 폼 제출값은 그대로 챕터 체크박스(name="chapterIds")들이 담당해요.
 */
export default function SeriesAssignmentGroup({
  seriesTitle,
  chapters,
  defaultCheckedIds,
}: {
  seriesTitle: string;
  chapters: { id: string; title: string }[];
  defaultCheckedIds: string[];
}) {
  const [checked, setChecked] = useState<Set<string>>(() => new Set(defaultCheckedIds));
  const allCheckboxRef = useRef<HTMLInputElement>(null);

  const allChecked = chapters.length > 0 && chapters.every((ch) => checked.has(ch.id));
  const someChecked = chapters.some((ch) => checked.has(ch.id));

  useEffect(() => {
    if (allCheckboxRef.current) {
      allCheckboxRef.current.indeterminate = someChecked && !allChecked;
    }
  }, [someChecked, allChecked]);

  function toggleAll(next: boolean) {
    setChecked(next ? new Set(chapters.map((ch) => ch.id)) : new Set());
  }

  function toggleOne(chapterId: string, next: boolean) {
    setChecked((prev) => {
      const updated = new Set(prev);
      if (next) updated.add(chapterId);
      else updated.delete(chapterId);
      return updated;
    });
  }

  return (
    <div>
      <label className="flex items-center gap-1.5 text-xs font-medium text-zinc-600">
        <input
          ref={allCheckboxRef}
          type="checkbox"
          checked={allChecked}
          onChange={(e) => toggleAll(e.target.checked)}
          className="h-3.5 w-3.5 rounded border-zinc-300"
        />
        {seriesTitle}
      </label>
      <div className="mt-1 ml-5 flex flex-wrap gap-x-3 gap-y-1">
        {chapters.map((ch) => (
          <label key={ch.id} className="flex items-center gap-1.5 text-xs text-zinc-700">
            <input
              type="checkbox"
              name="chapterIds"
              value={ch.id}
              checked={checked.has(ch.id)}
              onChange={(e) => toggleOne(ch.id, e.target.checked)}
              className="h-3.5 w-3.5 rounded border-zinc-300"
            />
            {ch.title}
          </label>
        ))}
        {chapters.length === 0 && <span className="text-xs text-zinc-400">챕터 없음</span>}
      </div>
    </div>
  );
}
