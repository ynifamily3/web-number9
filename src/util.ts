export function shuffleArray<T>(array: T[]): T[] {
  const shuffled = [...array]; // 원본 배열을 변경하지 않도록 복사
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1)); // 0부터 i까지 랜덤 인덱스 선택
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]]; // 요소 교환
  }
  return shuffled;
}
