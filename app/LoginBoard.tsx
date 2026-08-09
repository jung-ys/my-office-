"use client";

import { useState, useTransition } from "react";
import { loginAsStudent } from "./login-actions";

type StudentOption = { id: string; name: string; hasPin: boolean };

export default function LoginBoard({ students }: { students: StudentOption[] }) {
  const [selected, setSelected] = useState<StudentOption | null>(null);
  const [pin, setPin] = useState("");
  const [pending, startTransition] = useTransition();

  function submit(studentId: string, pinValue: string) {
    const formData = new FormData();
    formData.set("studentId", studentId);
    formData.set("pin", pinValue);
    startTransition(() => {
      loginAsStudent(formData);
    });
  }

  if (students.length === 0) {
    return (
      <p className="text-zinc-500 text-center">
        아직 등록된 학생이 없어요. 선생님께 관리자 페이지(/admin)에서 학생 등록을 요청하세요.
      </p>
    );
  }

  return (
    <div className="w-full max-w-md">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {students.map((s) => (
          <button
            key={s.id}
            type="button"
            disabled={pending}
            onClick={() => {
              if (s.hasPin) {
                setSelected(s);
              } else {
                submit(s.id, "");
              }
            }}
            className="rounded-xl border border-zinc-200 bg-white px-4 py-6 text-lg font-semibold text-zinc-800 shadow-sm transition hover:border-indigo-400 hover:bg-indigo-50 disabled:opacity-50"
          >
            {s.name}
          </button>
        ))}
      </div>

      {selected && (
        <div className="fixed inset-0 flex items-center justify-center bg-black/40 p-4">
          <div className="w-full max-w-xs rounded-2xl bg-white p-6 shadow-xl">
            <h2 className="mb-1 text-lg font-bold">{selected.name}님, 안녕하세요!</h2>
            <p className="mb-4 text-sm text-zinc-500">비밀번호(PIN)를 입력해주세요.</p>
            <input
              autoFocus
              inputMode="numeric"
              maxLength={4}
              value={pin}
              onChange={(e) => setPin(e.target.value.replace(/\D/g, ""))}
              onKeyDown={(e) => {
                if (e.key === "Enter") submit(selected.id, pin);
              }}
              className="mb-4 w-full rounded-lg border border-zinc-300 px-3 py-2 text-center text-2xl tracking-[0.5em]"
              placeholder="••••"
            />
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => {
                  setSelected(null);
                  setPin("");
                }}
                className="flex-1 rounded-lg border border-zinc-300 py-2 text-zinc-600"
              >
                취소
              </button>
              <button
                type="button"
                disabled={pending || pin.length === 0}
                onClick={() => submit(selected.id, pin)}
                className="flex-1 rounded-lg bg-indigo-600 py-2 font-semibold text-white disabled:opacity-50"
              >
                입장하기
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
