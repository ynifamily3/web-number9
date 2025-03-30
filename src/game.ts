export type Action = {
  type: "0" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9";
  direction: "up" | "down" | "left" | "right";
  x: number; // x coordinate
  y: number; // y coordinate
};

export const timeout = 60 - 1; // 60초

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
  "#D9F2FD",
  "#6FC9F8",
  "#28A5F3",
  "#1287DE",
  "#0C60AE",
  "#F0E111",
  "#BDB433",
  "#8A8541",
  "#57553A",
  "#33332C",
] as const; // 색상 배열

// 타일 한 칸의 상태
export type RenderedTile = {
  color: string; // 색상
  border: [1 | 0, 1 | 0, 1 | 0, 1 | 0]; // 임시: border (상, 좌, 하, 우)
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
