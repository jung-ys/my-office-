import { prisma } from "@/lib/db";
import { getStudentSession } from "@/lib/auth";
import { getTextbookVideosWithProgress } from "@/lib/progress";
import { selectTextbook } from "../actions";

export default async function TextbookListPage() {
  const student = await getStudentSession();
  if (!student) return null;

  const textbooks = await prisma.textbook.findMany({ orderBy: { order: "asc" } });

  const withProgress = await Promise.all(
    textbooks.map(async (t) => {
      const videos = await getTextbookVideosWithProgress(t.id, student.id);
      const watched = videos.filter((v) => v.watched).length;
      return { textbook: t, watched, total: videos.length };
    })
  );

  return (
    <div className="flex flex-col gap-4 py-6">
      <h1 className="text-lg font-bold text-zinc-900">📚 교재를 선택하세요</h1>
      <p className="text-sm text-zinc-500">
        교재를 선택하면 그 안의 영상들이 순서대로 연결돼요.
      </p>

      <div className="flex flex-col gap-3">
        {withProgress.map(({ textbook, watched, total }) => (
          <form key={textbook.id} action={selectTextbook.bind(null, textbook.id)}>
            <button
              type="submit"
              className={`w-full rounded-xl border px-5 py-4 text-left shadow-sm transition ${
                student.currentTextbookId === textbook.id
                  ? "border-indigo-400 bg-indigo-50"
                  : "border-zinc-200 bg-white hover:border-indigo-300 hover:bg-indigo-50/50"
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-semibold text-zinc-900">📘 {textbook.title}</span>
                {student.currentTextbookId === textbook.id && (
                  <span className="rounded-full bg-indigo-600 px-2 py-0.5 text-xs font-medium text-white">
                    학습중
                  </span>
                )}
              </div>
              <p className="mt-1 text-xs text-zinc-500">
                {watched} / {total}강 완료
              </p>
            </button>
          </form>
        ))}
        {textbooks.length === 0 && (
          <p className="text-zinc-500">아직 등록된 교재가 없어요. 선생님께 문의해주세요.</p>
        )}
      </div>
    </div>
  );
}
