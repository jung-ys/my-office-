/**
 * 시리즈 제목에서 "교재 이름(base)"과 "권 번호(vol)"를 추출합니다.
 * 예) "777 초등영문법 2권" → { base: "777 초등영문법", vol: 2 }
 *     "리더스뱅크3"        → { base: "리더스뱅크", vol: 3 }
 * 끝이 숫자(+"권")로 끝나지 않는 시리즈 제목은 null을 반환합니다.
 */
export function parseSeriesVolume(title: string): { base: string; vol: number } | null {
  const m = title.trim().match(/^(.*?)\s*(\d+)\s*권?$/);
  if (!m) return null;
  const base = m[1].trim();
  if (!base) return null;
  return { base, vol: Number(m[2]) };
}
