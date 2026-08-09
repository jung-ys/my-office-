// 학생용 앱(app/manifest.ts, scope "/")과는 별개의 PWA로 인식되도록
// scope를 "/admin"으로 분리한 관리자 전용 매니페스트입니다.
// (Next.js의 특수 파일 규칙인 manifest.ts는 app 루트에만 하나만 둘 수 있어서,
// 두 번째 매니페스트는 이렇게 일반 라우트 핸들러로 직접 만들어요.)
export const dynamic = "force-static";

export function GET() {
  return Response.json(
    {
      name: "삼성영어 셀레나 삼양캠퍼스 관리자",
      short_name: "셀레나 관리자",
      description: "삼성영어 셀레나 삼양캠퍼스 관리자 페이지",
      start_url: "/admin",
      scope: "/admin",
      display: "standalone",
      background_color: "#fafafa",
      theme_color: "#334155",
      lang: "ko",
      icons: [
        { src: "/icons/admin-192", sizes: "192x192", type: "image/png" },
        { src: "/icons/admin-192", sizes: "192x192", type: "image/png", purpose: "maskable" },
        { src: "/icons/admin-512", sizes: "512x512", type: "image/png" },
        { src: "/icons/admin-512", sizes: "512x512", type: "image/png", purpose: "maskable" },
      ],
    },
    { headers: { "Content-Type": "application/manifest+json" } }
  );
}
