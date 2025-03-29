import { useEffect, useMemo, useState } from "react";
import {
  Action,
  colors,
  rawNumbers,
  RenderedTile,
  shapes,
  timeout,
} from "./game";
import { toast } from "react-toastify";
import { shuffleArray } from "./util";

const _void: RenderedTile = {
  type: "",
  color: "white",
  floor: -1,
  id: -1,
};
const emptyGrid: (string | null)[][] = Array.from({ length: 20 }, () =>
  Array.from({ length: 20 }, () => null)
);

function App() {
  // 랜덤한 숫자 배열 생성
  const [numbers, setNumbers] = useState(
    () => shuffleArray(rawNumbers) as Action["type"][]
    // () => ["9", "9", "9", "9", "1"] as Action["type"][]
    // () => ["0", "1", "1"] as Action["type"][]
    // () => ["3", "3", "7"] as Action["type"][]
  );
  // 20 x 20 grid (tiles)
  const [grid, setGrid] = useState<RenderedTile[][]>(
    Array.from({ length: 20 }, () => Array.from({ length: 20 }, () => _void))
  );

  const [direction, setDirection] = useState<Action["direction"]>("up");
  const [order, setOrder] = useState<number>(0);
  const [score, setScore] = useState<number>(0);
  const actionType = numbers[order];
  // 마우스 올린 (포커스한) 타일의 좌표
  const [hoveredTile, setHoveredTile] = useState<{
    x: number;
    y: number;
  } | null>(null);

  const isGameEnded = order >= numbers.length;

  const [remainSec, setRemainSec] = useState(() => Math.floor(timeout)); // 남은 시간 (초)
  // 한 턴 시간제한
  useEffect(() => {
    if (isGameEnded) return;
    // 첫번째 턴은 타이머 안 돈다.
    if (order === 0) {
      setRemainSec(timeout);
      return;
    }
    const timer = setInterval(() => {
      setRemainSec((_remain) => _remain - 1);
    }, 1000);
    return () => {
      clearInterval(timer);
    };
  }, [isGameEnded, order]);

  useEffect(() => {
    if (remainSec < 0) {
      toast.error("시간 초과! 현재 타일을 버리겠습니다.");
      setOrder((prev) => prev + 1);
      setRemainSec(timeout);
    }
  }, [remainSec]);

  // 마우스 올린 좌표 미리보기 (null 또는 해당 색깔)
  const hoveredGrid = useMemo(() => {
    if (isGameEnded) return emptyGrid;
    if (!hoveredTile) return emptyGrid;
    const { x, y } = hoveredTile;
    const newGrid = emptyGrid.map((row) => row.slice());
    const shape = shapes[actionType][direction];
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          const newX = x + j;
          const newY = y + i;
          if (
            newX >= 0 &&
            newX < grid[0].length &&
            newY >= 0 &&
            newY < grid.length
          ) {
            newGrid[newY][newX] = colors[actionType];
          } else {
            return emptyGrid; // 범위를 벗어나면 빈 배열 반환
          }
        }
      }
    }
    return newGrid;
  }, [hoveredTile, actionType, direction, grid, isGameEnded]);

  const isValid = (action: Action) => {
    const { x, y, direction, type } = action;
    const shape = shapes[type][direction];
    const shapeHeight = shape.length;
    const shapeWidth = shape[0].length;
    const gridHeight = grid.length;
    const gridWidth = grid[0].length;
    // 범위 체크 (grid의 크기만큼 체크)
    console.log(
      "x:",
      x,
      "y:",
      y,
      "shapeWidth:",
      shapeWidth,
      "shapeHeight:",
      shapeHeight
    );
    console.log(x + shapeWidth > gridWidth, y + shapeHeight > gridHeight);
    if (x + shapeWidth > gridWidth || y + shapeHeight > gridHeight) {
      return { type: false, message: "범위를 벗어났습니다." };
    }

    // 처음 두는 건 무조건 둘 수 있습니다.
    if (order === 0) return { type: true, message: "" };

    // 이미 있는 타일과 인접해야 한다.
    let isAdjacent = false;
    for (let r = 0; r < shapeHeight; r++) {
      for (let c = 0; c < shapeWidth; c++) {
        if (!shape[r][c]) continue;
        // 자기 자신 체크(처음 다음 층 만들 때 유효함) + 4방향 체크
        const adjacentTiles = [
          { x: x, y: y }, // 자기 자신
          { x: x + c, y: y + r - 1 }, // 위
          { x: x + c, y: y + r + 1 }, // 아래
          { x: x + c - 1, y: y + r }, // 왼쪽
          { x: x + c + 1, y: y + r }, // 오른쪽
        ];
        for (const tile of adjacentTiles) {
          const { x: adjX, y: adjY } = tile;
          if (
            adjX >= 0 &&
            adjX < gridWidth &&
            adjY >= 0 &&
            adjY < gridHeight &&
            grid[adjY][adjX].floor !== -1
          ) {
            isAdjacent = true;
            break;
          }
        }
      }
      if (isAdjacent) break;
    }
    if (!isAdjacent) {
      return { type: false, message: "인접한 타일이 없습니다." };
    }

    // 이미 깔린 타일과 현재 깔 타일의 층수가 다른 것이 있으면 안 된다.
    let pivotFloor = -2;
    for (let r = 0; r < shapeHeight; r++) {
      for (let c = 0; c < shapeWidth; c++) {
        if (!shape[r][c]) continue;
        pivotFloor = pivotFloor === -2 ? grid[y + r][x + c].floor : pivotFloor;
        const newX = x + c;
        const newY = y + r;
        if (
          newX >= 0 &&
          newX < gridWidth &&
          newY >= 0 &&
          newY < gridHeight &&
          grid[newY][newX].floor !== pivotFloor
        ) {
          return {
            type: false,
            message: `밑 층에 구멍이 있으면 쌓을 수 없습니다.`,
          };
        }
      }
    }

    // -1 층에 쌓는 것이 아닌 이상, 이미 깔린 타일의 id가 모두 같으면 안된다. (한 블럭이라도 달라야 한다)
    // -1 층에 쌓는 경우는 예외로 둠
    const _id = grid[y][x].id;
    let hasDifferentId = _id === -1 ? true : false;
    for (let r = 0; r < shapeHeight; r++) {
      for (let c = 0; c < shapeWidth; c++) {
        if (!shape[r][c]) continue;
        const newX = x + c;
        const newY = y + r;
        if (
          newX >= 0 &&
          newX < gridWidth &&
          newY >= 0 &&
          newY < gridHeight &&
          grid[newY][newX].id !== _id
        ) {
          hasDifferentId = true;
          break;
        }
      }
      if (hasDifferentId) break;
    }
    if (!hasDifferentId) {
      return {
        type: false,
        message: "밑 층의 블럭 두 개 이상 걸쳐서 쌓아야 합니다.",
      };
    }
    return { type: true, message: "" };
    // return { type: false, message: "TODO: 유효성 검사 구현하기" };
  };

  const setNumber = (action: Action) => {
    const newGrid = grid.map((row) => row.slice());
    const { x, y, direction, type } = action;

    const shape = shapes[type][direction];

    // 최고 층 수 구하기
    let maxFloor = -1;
    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          maxFloor = Math.max(maxFloor, newGrid[y + i][x + j].floor);
        }
      }
    }

    for (let i = 0; i < shape.length; i++) {
      for (let j = 0; j < shape[i].length; j++) {
        if (shape[i][j] === 1) {
          newGrid[y + i][x + j] = {
            type,
            color: colors[type],
            floor: maxFloor + 1,
            id: order,
          };
        }
      }
    }
    // 점수 계산도 여기서 해버린다.
    setScore((prev) => prev + (maxFloor + 1) * +type);
    setGrid(newGrid);
  };

  return (
    <div className="">
      <table className="">
        <tbody>
          {grid.map((row, rowIndex) => (
            <tr key={rowIndex}>
              {row.map((tile, colIndex) => (
                <td
                  key={colIndex}
                  className="relative size-[22px] border-1 border-gray-300"
                  style={{
                    backgroundColor: tile["color"] || "white",
                  }}
                >
                  <button
                    className="text-center size-full text-sm"
                    disabled={isGameEnded}
                    onClick={() => {
                      const { message, type } = isValid({
                        x: colIndex,
                        y: rowIndex,
                        type: actionType,
                        direction,
                      });
                      if (type === false) {
                        toast.error("그렇게는 둘 수 없습니다: " + message);
                        return;
                      }
                      setNumber({
                        x: colIndex,
                        y: rowIndex,
                        type: actionType,
                        direction,
                      });
                      setOrder((prev) => prev + 1);
                      setRemainSec(timeout);
                      toast(
                        `${actionType}(${
                          direction === "up"
                            ? "↑"
                            : direction === "down"
                            ? "↓"
                            : direction === "left"
                            ? "←"
                            : "→"
                        })을 (${colIndex}, ${rowIndex})에 두었습니다.`
                      );
                      // 게임 끝났으면 점수 알림
                      if (order + 1 >= numbers.length) {
                        toast(`게임이 끝났습니다. 점수: ${score}점`);
                      }
                    }}
                    onMouseEnter={() => {
                      if (isGameEnded) return;
                      setHoveredTile({ x: colIndex, y: rowIndex });
                    }}
                    onMouseLeave={() => {
                      if (isGameEnded) return;
                      setHoveredTile(null);
                    }}
                    onFocus={() => {
                      if (isGameEnded) return;
                      setHoveredTile({ x: colIndex, y: rowIndex });
                    }}
                    onBlur={() => {
                      if (isGameEnded) return;
                      setHoveredTile(null);
                    }}
                    // 마우스 오른쪽 버튼으로 회전
                    onContextMenu={(e) => {
                      e.preventDefault();
                      if (isGameEnded) return;
                      const newDirection = (() => {
                        switch (direction) {
                          case "up":
                            return "right";
                          case "right":
                            return "down";
                          case "down":
                            return "left";
                          case "left":
                            return "up";
                        }
                      })();
                      setDirection(newDirection);
                    }}
                  >
                    {tile["floor"] === -1 ? "" : tile["floor"]}
                  </button>
                  {/* 마우스를 올렸을 때 임시로 나오는 부분*/}
                  {!isGameEnded && (
                    <div
                      className="absolute pointer-events-none top-0 left-0 w-full h-full opacity-50 text-center"
                      style={{
                        // 배경색을 hoveredGrid의 색상으로 설정
                        backgroundColor:
                          hoveredGrid[rowIndex][colIndex] || "transparent",
                      }}
                    />
                  )}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      남은시간: {order === 0 ? "--" : Math.max(0, remainSec)}초
      <br />
      {!isGameEnded && `현재 차례: ${order + 1} / ${numbers.length}`}
      <br />
      {/* current Tile: {isGameEnded ? "game ended" : actionType}
      <br /> */}
      점수: {score}
      <br />
      {/* Focused Tile:{" "}
      {isGameEnded
        ? "game ended!"
        : hoveredTile
        ? `(${hoveredTile?.y}, ${hoveredTile?.x})`
        : ""} */}
      {/* <hr /> */}
      {/* {!isGameEnded && (
        <div className="flex flex-col">
          {["up", "down", "left", "right"].map((_dir) => (
            <div key={_dir} className="flex items-center">
              <input
                type="radio"
                name="actionDirection"
                value={_dir}
                id={`actionDirection-${_dir}`}
                onChange={() => setDirection(_dir as Action["direction"])}
                checked={direction === _dir}
                className="mr-2"
              />
              <label htmlFor={`actionDirection-${_dir}`}>{_dir}</label>
            </div>
          ))}
        </div>
      )} */}
      {/* <hr /> */}
      {/* 게임 재시작 버튼 */}
      <button
        className="bg-blue-500 text-white px-4 py-2 rounded mt-3 hover:cursor-pointer"
        onClick={() => {
          setGrid(
            Array.from({ length: 20 }, () =>
              Array.from({ length: 20 }, () => _void)
            )
          );
          setNumbers(shuffleArray(rawNumbers) as Action["type"][]);
          setOrder(0);
          setScore(0);
          setDirection("up");
          setHoveredTile(null);
          setRemainSec(Math.floor(timeout));
          toast("게임이 재시작되었습니다.");
        }}
      >
        Restart Game
      </button>
    </div>
  );
}

export default App;
