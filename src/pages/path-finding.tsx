import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from 'three-stdlib'
import { Canvas, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { button, LevaPanel, useControls, useCreateStore } from "leva";
import {
  createRef,
  Fragment,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Mesh, MeshStandardMaterial, Object3D } from "three";
import { create } from "zustand";
import useWindowDimensions from "./../utils/useWindowDimensions";
import Drawer from "../utils/Drawer";
import { StoreType } from "leva/dist/declarations/src/types";

const wall = 1;
const start = 2;
const end = 3;
const norm = 0;
const gap = 1.1;

interface storeState {
  maze: (h: number) => number[][];
  isFinding: boolean;
  boxs: MutableRefObject<Array<Array<Mesh | null>>>;
  baseColor: string;
  normColor: string;
  boxCount: number;
  delayTime: number;
  pause: boolean;
  wallColor: string;
  visitColor: string;
  startColor: string;
  endColor: string;
  pathColor: string;
  array: Array<Array<number>>;
}

const initialState = {
  maze: noWallsMaze,
  startColor: "red",
  endColor: "green",
  pause: false,
  array: [[]],
  delayTime: 1 / 5,
  boxCount: 10,
  isFinding: false,
  boxs: createRef<Array<Array<Mesh | null>>>() as React.MutableRefObject<
    Array<Array<Mesh | null>>
  >,
  baseColor: "#111111",
  normColor: "slategray",
  wallColor: "#000852",
  visitColor: "cyan",
  pathColor: "yellow",
}

const store = create<storeState>(() => ({
  ...initialState,
}));

const setRefThroughArray = () => {
  const array = store.getState().array;
  const boxCount = store.getState().boxCount;
  const offset = ((boxCount - 1) * gap) / 2;
  for (let i = 0; i < boxCount; i++) {
    for (let j = 0; j < boxCount; j++) {
      store
        .getState()
        .boxs.current[i][j]?.position.set(i * gap - offset, 0, j * gap - offset);
      if (array[i][j] == start) {
        setColor(i, j, store.getState().startColor);
        setHeight(i, j, 1.9);
      }
      else if (array[i][j] == end) {
        setColor(i, j, store.getState().endColor);
        setHeight(i, j, 1.9);
      }
      else if (array[i][j] == wall) {
        setColor(i, j, store.getState().wallColor);
        setHeight(i, j, 1.9);
      } else {
        setColor(i, j, store.getState().normColor);
        setHeight(i, j, 1);
      }
    }
  }
};

let levaPathStore: StoreType;

export default function Path() {
  levaPathStore = useCreateStore();
  return (
    <Drawer>
      <div className="h-screen w-screen">
        <LevaPanel hideCopyButton titleBar={{ filter: false }} store={levaPathStore} />
        <Canvas>
          <Visualizer />
          <directionalLight position={[-0.5, 3, 5]} intensity={1.5} />
          <ambientLight intensity={0.5} />
        </Canvas>
      </div>
    </Drawer>
  )
}

function Visualizer() {
  const orbitControls = useRef<OrbitControlsImpl>(null!);
  const maze = store((state) => state.maze);
  const finding = store((state) => state.isFinding);
  const boxColor = store((state) => state.normColor);
  const baseColor = store((state) => state.baseColor);
  const boxCount = store((state) => state.boxCount);
  const [regenerate, setRegenerate] = useState(false);
  const boxsRef = useRef<Array<Array<Mesh | null>>>([]);
  let findingAlgorithm = bfs;
  const { camera } = useThree();
  const { height, width } = useWindowDimensions();
  useEffect(() => {
    camera.position.x = 0;
    camera.position.y = boxCount / 2;
    camera.position.z = (1 / Math.min(width, height)) * 1000 * boxCount;
    orbitControls.current.target.set(0, boxCount / 3, 0);
  }, [width, height, boxCount]);

  useControls("Controls", {
    "Play/Pause": button(() => {
      if (store.getState().isFinding) {
        store.setState({ pause: !store.getState().pause });
      } else {
        const result = findingAlgorithm(store.getState().array, [0, 0], [store.getState().boxCount - 1, store.getState().boxCount - 1]);
        animate(result.visitingOrder, result.path);
      }
    }),
    Reset: button(() => {
      reset();
    }),
    Count: {
      value: 10,
      min: 1,
      max: 100,
      step: 1,
      disabled: finding,
      onChange: (v: number) => store.setState({ boxCount: v }),
    },
    Speed: {
      value: 20,
      min: 1,
      max: 100,
      step: 1,
      onChange: (v) => {
        store.setState({ delayTime: 1 / v });
      },
    },
    Algorithm: {
      options: {
        "bfs": bfs,
        "Dfs": dfs,
      },
      disabled: finding,
      onChange: (v: (grid: number[][], start: number[], end: number[]) => {
        visitingOrder: number[][];
        path: number[][];
      }) => {
        findingAlgorithm = v;
      },
    },
    "Maze Generator": {
      options: {
        "None": noWallsMaze,
        "Recursive Division": recursiveDivisionGrid,
      },
      disabled: finding,
      onChange: (v: (h: number) => number[][]) => {
        if (store.getState().isFinding) return;
        store.setState({ maze: v });
      },
    },
    "Regenerate": button(() => {
      setRegenerate((v) => !v);
    }),
  }, { store: levaPathStore }, [finding]
  );
  useEffect(() => {
    store.setState({ array: [...maze(store.getState().boxCount)] });
    store.setState({ boxs: boxsRef });
    reset();
    return () => {
      if (store.getState().isFinding) {
        store.setState({ isFinding: false });
      }
    }
  }, [boxCount, regenerate, maze]);
  return (
    <>
      <OrbitControls ref={orbitControls} />
      {/* BARS */}
      {[...Array(boxCount)].map((_, i: number) => {
        boxsRef.current[i] = [];
        return (
          <Fragment key={i}>
            {[...Array(boxCount)].map((_, j) => {
              return (
                <mesh key={`${i}${j}`} ref={(e) => (boxsRef.current[i][j] = e)} onClick={(e) => {
                  e.stopPropagation();
                  const cords = getCords(e.object);
                  if (store.getState().array[i][j] !== wall) {
                    makeWall(cords[0], cords[1]);
                  } else {
                    makeNorm(cords[0], cords[1]);
                  }
                }}>
                  <boxBufferGeometry />
                  <meshStandardMaterial color={boxColor} />
                </mesh>
              );
            })}
          </Fragment>
        );
      })}
      {/* BASE */}
      <mesh position={[0, -0.1, 0]} scale={[boxCount * (gap + 0.1), 1, boxCount * 1.15]}>
        <boxBufferGeometry />
        <meshStandardMaterial color={baseColor} />
      </mesh>
      <color args={["#222222"]} attach="background" />
    </>
  );
}

async function reset() {
  if (store.getState().isFinding) {
    store.setState({ isFinding: false });
    return;
  }
  await delay(0.1);
  setRefThroughArray();
}

function getCords(object: Object3D) {
  let n = store.getState().boxCount;
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < n; j++) {
      if (store.getState().boxs.current[i][j] === object) {
        return [i, j];
      }
    }
  }
  return [-1, -1];
}

function makeWall(i: number, j: number) {
  store.getState().array[i][j] = wall;
  setColor(i, j, store.getState().wallColor);
  setHeight(i, j, 1.9);
}

function makeNorm(i: number, j: number) {
  store.getState().array[i][j] = norm;
  setColor(i, j, store.getState().normColor);
  setHeight(i, j, 1);
}

function setColor(i: number, j: number, c: string) {
  (
    store.getState().boxs.current[i][j]?.material as MeshStandardMaterial
  )?.color.set(c);
}

function setHeight(i: number, j: number, h: number) {
  gsap.to(store.getState().boxs.current[i][j]?.position as any, {
    y: h - 1,
    duration: 0.5,
    ease: "power1.out",
  });
}

async function bounce(i: number, j: number) {
  await gsap.to(store.getState().boxs.current[i][j]?.position as any, {
    y: 1,
    duration: 0.5,
    ease: "power1.out",
  });
  await gsap.to(store.getState().boxs.current[i][j]?.position as any, {
    y: 0,
    duration: 0.5,
    ease: "power1.in",
  });
}

const dd = async () => {
  if (!store.getState().isFinding) {
    reset();
    return true;
  }
  while (store.getState().pause) {
    await delay(0.5);
  }
  await delay(store.getState().delayTime);
  return false;
};

const dz = () => {
  if (!store.getState().isFinding) {
    reset();
    return true;
  }
  return false;
};

const delay = (s: number) => {
  if (s == 0) return;
  return new Promise((resolve) => setTimeout(resolve, s * 1000));
};

function rand(min: number, max: number) {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

function noWallsMaze(c: number) {
  const array = create2DArray(c);
  array[0][0] = start;
  array[c - 1][c - 1] = end;
  return array;
}

async function animate(visitingOrder: number[][], path: number[][]) {
  store.setState({ isFinding: true })
  setRefThroughArray();
  for (let i = 1; i < visitingOrder.length - 1; i++) {
    bounce(visitingOrder[i][0], visitingOrder[i][1]);
    setColor(visitingOrder[i][0], visitingOrder[i][1], store.getState().visitColor);
    await dd();
  }
  for (let i = 1; i < path.length - 1; i++) {
    bounce(path[i][0], path[i][1]);
    setColor(path[i][0], path[i][1], store.getState().pathColor);
    await dd();
  }
  store.setState({ isFinding: false })
}

function bfs(grid: number[][], start: number[], end: number[]): { visitingOrder: number[][], path: number[][] } {
  const rows = store.getState().boxCount;
  const cols = rows;
  const queue: number[][] = [];
  const distances: number[][] = [];
  const parents: number[][][] = [];
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const path: number[][] = [];
  const visitingOrder: number[][] = [];

  for (let i = 0; i < rows; i++) {
    distances[i] = [];
    parents[i] = [];
    for (let j = 0; j < cols; j++) {
      distances[i][j] = -1;
      parents[i][j] = [-1, -1];
    }
  }

  distances[start[0]][start[1]] = 0;
  parents[start[0]][start[1]] = [-1, -1];
  queue.push(start);

  while (queue.length) {
    const curr = queue.shift() as number[];
    const row = curr[0];
    const col = curr[1];

    visitingOrder.push(curr);

    if (row === end[0] && col === end[1]) {
      let currNode = curr;
      while (currNode[0] !== -1 && currNode[1] !== -1) {
        path.unshift(currNode);
        currNode = parents[currNode[0]]?.[currNode[1]] || [-1, -1];
      }
      return { visitingOrder, path };
    }

    for (const dir of dirs) {
      const newRow = row + dir[0];
      const newCol = col + dir[1];
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && grid[newRow]?.[newCol] !== 1 && distances[newRow][newCol] === -1) {
        distances[newRow][newCol] = distances[row][col] + 1;
        parents[newRow][newCol] = [row, col];
        queue.push([newRow, newCol]);
      }
    }
  }

  return { visitingOrder, path: [] };
}

function dfs(grid: number[][], start: number[], end: number[]): { visitingOrder: number[][], path: number[][] } {
  const rows = grid.length;
  const cols = grid[0]?.length || 0;
  const stack: number[][] = [];
  const parents: number[][][] = [];
  const dirs = [[0, 1], [0, -1], [1, 0], [-1, 0]];
  const path: number[][] = [];
  const vis = create2DArray(store.getState().boxCount);
  const visitingOrder: number[][] = [];

  for (let i = 0; i < rows; i++) {
    parents[i] = [];
    for (let j = 0; j < cols; j++) {
      parents[i][j] = [-1, -1];
    }
  }

  parents[start[0]][start[1]] = [-1, -1];
  stack.push(start);

  while (stack.length) {
    const curr = stack.pop() as number[];
    const row = curr[0];
    const col = curr[1];

    visitingOrder.push(curr);
    vis[row][col] = 1;

    if (row === end[0] && col === end[1]) {
      let currNode = curr;
      while (currNode[0] !== start[0] || currNode[1] !== start[1]) {
        path.unshift(currNode);
        currNode = parents[currNode[0]]?.[currNode[1]] || start;
      }
      path.unshift(start);
      return { visitingOrder, path };
    }

    for (const dir of dirs) {
      const newRow = row + dir[0];
      const newCol = col + dir[1];
      if (newRow >= 0 && newRow < rows && newCol >= 0 && newCol < cols && grid[newRow][newCol] !== 1 && vis[newRow][newCol] === 0) {
        parents[newRow][newCol] = [row, col];
        stack.push([newRow, newCol]);
      }
    }
  }

  return { visitingOrder, path: [] };
}

function create2DArray(c: number) {
  const array = new Array(c);
  for (let i = 0; i < c; i++) array[i] = new Array(c);
  for (let i = 0; i < c; i++) {
    for (let j = 0; j < c; j++) {
      array[i][j] = 0;
    }
  }
  return array;
}

function recursiveDivisionGrid(width: number): number[][] {
  const height = width;
  let grid = Array(height)
    .fill(null)
    .map(() => Array(width).fill(0));

  let startNode = [0, 0];
  let endNode = [height - 1, width - 1];

  grid[startNode[0]][startNode[1]] = 2;
  grid[endNode[0]][endNode[1]] = 3;
  const walls = recursiveDivisionMaze(grid, startNode, endNode);
  for (let i = 0; i < walls.length; i++) {
    grid[walls[i][0]][walls[i][1]] = 1;
  }
  return grid;
}

let walls: number[][];
export function recursiveDivisionMaze(grid: number[][], startNode: number[], finishNode: number[]) {
  if (!startNode || !finishNode || startNode === finishNode) {
    return [];
  }
  let vertical = range(grid[0].length);
  let horizontal = range(grid.length);
  walls = [];
  getRecursiveWalls(vertical, horizontal, grid, startNode, finishNode);
  return walls;
}

function range(len: number) {
  let result = [];
  for (let i = 0; i < len; i++) {
    result.push(i);
  }
  return result;
}

//dir === 0 => Horizontal
//dir === 1 => Vertical

function getRecursiveWalls(vertical: number[], horizontal: number[], grid: number[][], startNode: number[], finishNode: number[]) {
  if (vertical.length < 2 || horizontal.length < 2) {
    return;
  }
  let dir: number = 0;
  let num: number = 0;
  if (vertical.length > horizontal.length) {
    dir = 0;
    num = generateOddRandomNumber(vertical);
  }
  if (vertical.length <= horizontal.length) {
    dir = 1;
    num = generateOddRandomNumber(horizontal);
  }

  if (dir === 0) {
    addWall(dir, num, vertical, horizontal, startNode, finishNode);
    getRecursiveWalls(
      vertical.slice(0, vertical.indexOf(num)),
      horizontal,
      grid,
      startNode,
      finishNode
    );
    getRecursiveWalls(
      vertical.slice(vertical.indexOf(num) + 1),
      horizontal,
      grid,
      startNode,
      finishNode
    );
  } else {
    addWall(dir, num, vertical, horizontal, startNode, finishNode);
    getRecursiveWalls(
      vertical,
      horizontal.slice(0, horizontal.indexOf(num)),
      grid,
      startNode,
      finishNode
    );
    getRecursiveWalls(
      vertical,
      horizontal.slice(horizontal.indexOf(num) + 1),
      grid,
      startNode,
      finishNode
    );
  }
}

function generateOddRandomNumber(array: number[]) {
  let max = array.length - 1;
  let randomNum =
    Math.floor(Math.random() * (max / 2)) +
    Math.floor(Math.random() * (max / 2));
  if (randomNum % 2 === 0) {
    if (randomNum === max) {
      randomNum -= 1;
    } else {
      randomNum += 1;
    }
  }
  return array[randomNum] as number;
}

//dir === 0 => Horizontal
//dir === 1 => Vertical

function addWall(dir: number, num: number, vertical: number[], horizontal: number[], startNode: number[], finishNode: number[]) {
  let isStartFinish = false;
  let tempWalls = [];
  if (dir === 0) {
    if (horizontal.length === 2) return;
    for (let temp of horizontal) {
      if (
        (temp === startNode[0] && num === startNode[1]) ||
        (temp === finishNode[0] && num === finishNode[1])
      ) {
        isStartFinish = true;
        continue;
      }
      tempWalls.push([temp, num]);
    }
  } else {
    if (vertical.length === 2) return;
    for (let temp of vertical) {
      if (
        (num === startNode[0] && temp === startNode[1]) ||
        (num === finishNode[0] && temp === finishNode[1])
      ) {
        isStartFinish = true;
        continue;
      }
      tempWalls.push([num, temp]);
    }
  }
  if (!isStartFinish) {
    tempWalls.splice(generateRandomNumber(tempWalls.length), 1);
  }
  for (let wall of tempWalls) {
    walls.push(wall);
  }
}

function generateRandomNumber(max: number) {
  let randomNum =
    Math.floor(Math.random() * (max / 2)) +
    Math.floor(Math.random() * (max / 2));
  if (randomNum % 2 !== 0) {
    if (randomNum === max) {
      randomNum -= 1;
    } else {
      randomNum += 1;
    }
  }
  return randomNum;
}
