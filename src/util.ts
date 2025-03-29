export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // 원본 배열을 변경하지 않도록 복사
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지 랜덤 인덱스 선택
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 요소 교환
  }
  return shuffled;
}
// 남은 시간이 10초 이하일 때 1초마다 배경색을 점차 빨간색으로 하기 위함
export const redColors = [
  "rgb(255, 255, 255)", // 하얀색
  "rgb(255, 230, 230)",
  "rgb(255, 200, 200)",
  "rgb(255, 170, 170)",
  "rgb(255, 140, 140)",
  "rgb(255, 110, 110)",
  "rgb(255, 80, 80)",
  "rgb(255, 50, 50)",
  "rgb(255, 20, 20)",
  "rgb(150, 0, 0)", // 검붉은 색
];
