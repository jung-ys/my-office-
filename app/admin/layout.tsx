import type { Metadata, Viewport } from "next";

// 학생용 앱과 별개의 아이콘/이름으로 "홈 화면에 추가"할 수 있도록,
// /admin 하위 전체에 관리자 전용 매니페스트를 연결합니다.
export const metadata: Metadata = {
  manifest: "/manifest-admin",
  appleWebApp: {
    title: "셀레나 관리자",
    statusBarStyle: "default",
  },
};

export const viewport: Viewport = {
  themeColor: "#334155",
};

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
