import { redirect } from "next/navigation";
import { getStudentSession } from "@/lib/auth";
import StudentHeader from "./StudentHeader";

export default async function StudentLayout({ children }: { children: React.ReactNode }) {
  const student = await getStudentSession();
  if (!student) {
    redirect("/");
  }

  return (
    <div className="flex min-h-screen flex-col">
      <StudentHeader name={student.name} />
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">{children}</main>
    </div>
  );
}
