export type Action = {
  type: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  direction: "up" | "down" | "left" | "right";
  x: number; // x coordinate
  y: number; // y coordinate
};

export const timeout = 13 - 1; // 60초

export const rawNumbers = [
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
  "0",
  "1",
  "2",
  "3",
  "4",
  "5",
  "6",
  "7",
  "8",
  "9",
] as Action["type"][]; // 0~9까지의 숫자 배열

export const colors = [
  "#F8C8DC", // 연분홍
  "#FCEECF", // 바닐라 크림
  "#BEE7E9", // 민트
  "#A7C7E7", // 소프트 블루
  "#FFD1A9", // 살구
  "#D4A5E1", // 라일락
  "#F9F871", // 레몬 옐로우
  "#C5E1A5", // 페일 그린
  "#E6C7EB", // 연한 퍼플
  "#F6B5A9", // 코랄 피치
] as const; // 색상 배열

// 타일 한 칸의 상태
export type RenderedTile = {
  color: string; // 색상
  type: "" | Action["type"]; // 타일 종류 (렌더링될거임)
  floor: number; // 0 for ground, 1 for first floor, etc.
  id: number; // 서로 다른 타일을 구별하기 위한 id
};

function rotate180(matrix: number[][]): number[][] {
  return rotate90(rotate90(matrix));
}

function rotate270(matrix: number[][]): number[][] {
  return rotate90(rotate90(rotate90(matrix)));
}

const basicShapes = [
  [
    [1, 1, 1],
    [1, 0, 1],
    [1, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1],
    [0, 1],
    [0, 1],
    [0, 1],
  ],
  [
    [0, 1, 1],
    [0, 1, 1],
    [1, 1, 0],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 0, 1],
    [0, 1, 1],
    [1, 1, 1],
  ],
  [
    [0, 1, 1],
    [0, 1, 0],
    [1, 1, 1],
    [0, 1, 1],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [0, 0, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 0],
    [1, 0, 0],
    [1, 1, 1],
    [1, 1, 1],
  ],
  [
    [1, 1, 1],
    [0, 1, 0],
    [1, 1, 0],
    [1, 0, 0],
  ],
  [
    [0, 1, 1],
    [0, 1, 1],
    [1, 1, 0],
    [1, 1, 0],
  ],
  [
    [1, 1, 1],
    [1, 1, 1],
    [1, 1, 0],
    [1, 1, 0],
  ],
];

export const shapes = Array.from({ length: basicShapes.length }, (_, i) => ({
  up: basicShapes[i],
  right: rotate90(basicShapes[i]),
  down: rotate180(basicShapes[i]),
  left: rotate270(basicShapes[i]),
}));

function rotate90(matrix: number[][]): number[][] {
  const rows = matrix.length;
  const cols = matrix[0].length;
  const rotated: number[][] = Array.from({ length: cols }, () =>
    Array(rows).fill(0)
  );

  for (let r = 0; r < rows; r++) {
    for (let c = 0; c < cols; c++) {
      rotated[c][rows - 1 - r] = matrix[r][c];
    }
  }

  return rotated;
}
