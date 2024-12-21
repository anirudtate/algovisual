import { MutableRefObject } from "react";
import { Mesh } from "three";
import gsap from "gsap";
import * as THREE from "three";

interface PathfindingAnimation {
  nodes: MutableRefObject<(Mesh | null)[][]>;
  grid: number[][];
  speed: MutableRefObject<number>;
  onComplete: () => void;
  isPaused: MutableRefObject<boolean>;
  shouldStop: MutableRefObject<boolean>;
}

export type AlgorithmType = 'bfs' | 'dfs' | 'dijkstra' | 'astar';
export type MazeAlgorithmType = 'recursive' | 'horizontal' | 'vertical' | 'random';

export class PathfindingError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'PathfindingError';
  }
}

const COLORS = {
  default: "#93c5fd",    // Light Blue
  wall: "#312e81",       // Deep Indigo
  start: "#ef4444",      // Pure Red
  end: "#15803d",        // Forest Green
  visiting: "#0ea5e9",   // Sky Blue
  visited: "#0ea5e9",    // Bright Purple
  path: "#eab308",       // Yellow
};

export const resetNodeColors = (
  nodes: MutableRefObject<(Mesh | null)[][]>,
  grid: number[][]
) => {
  grid.forEach((row, i) => {
    row.forEach((cell, j) => {
      const color = cell === 2 ? COLORS.start
        : cell === 3 ? COLORS.end
        : cell === 1 ? COLORS.wall
        : COLORS.default;
      
      const node = nodes.current[i][j];
      if (node) {
        // Kill any existing animations on the node and its parent
        gsap.killTweensOf(node?.position);
        if (node.parent) {
          gsap.killTweensOf(node.parent.position);
          
          // Reset the parent group's y position
          node.parent.position.y = cell === 1 || cell == 2 || cell ==3 ? 0.1 : -0.4;
        }
        
        // Reset the node's position to origin
        node.position.set(0, 0, 0);
        
        // Reset color and scale
        (node.material as THREE.MeshPhongMaterial).color.setStyle(color);
        node.scale.set(1, 1, 1);
      }
    });
  });
};

const delay = async (
  speedRef: MutableRefObject<number>,
  isPaused: MutableRefObject<boolean>,
  shouldStop: MutableRefObject<boolean>
): Promise<void> => {
  if (shouldStop.current) {
    throw new PathfindingError('Pathfinding stopped by user');
  }
  
  while (isPaused.current) {
    // Pause all GSAP animations while in paused state
    gsap.globalTimeline.pause();
    await new Promise(resolve => setTimeout(resolve, 100));
    if (shouldStop.current) {
      throw new PathfindingError('Pathfinding stopped by user');
    }
  }
  
  // Resume GSAP animations when unpaused
  gsap.globalTimeline.play();
  
  const duration = 1 / speedRef.current;
  return new Promise(resolve => setTimeout(resolve, duration * 1000));
};

const animateNode = (
  node: Mesh | null,
  color: string,
  speedRef: MutableRefObject<number>,
  height: number = 0,
  bounce: boolean = false
) => {
  if (!node) return;

  const duration = 1 / speedRef.current;
  const material = node.material as THREE.MeshStandardMaterial;

  // Kill any existing animations on this node
  gsap.killTweensOf(material.color);
  gsap.killTweensOf(node.position);

  // Animate color
  gsap.to(material.color, {
    r: parseInt(color.slice(1, 3), 16) / 255,
    g: parseInt(color.slice(3, 5), 16) / 255,
    b: parseInt(color.slice(5, 7), 16) / 255,
    duration: duration,
    overwrite: true,
  });

  if (bounce) {
    gsap.timeline({ 
      overwrite: true,
      onComplete: () => {
        // Ensure the node is at the correct final position and color
        gsap.set(node.position, { y: height });
        material.color.setStyle(color);
      }
    })
      .to(node.position, {
        y: height,  // Start at the final height
        duration: 0
      })
      .to(node.position, {
        y: height + 1,  // Bounce up from the height
        duration: duration * 1.5,
        ease: "power2.out"
      })
      .to(node.position, {
        y: height,  // Return to the final height
        duration: duration * 1.5,
        ease: "bounce.out"
      });
  } else {
    gsap.to(node.position, {
      y: height,
      duration: duration,
      ease: "power2.out",
      overwrite: true,
      onComplete: () => {
        // Ensure the node is at the correct final position and color
        gsap.set(node.position, { y: height });
        material.color.setStyle(color);
      }
    });
  }
};

// Breadth First Search
export const bfs = async ({
  nodes,
  grid,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: PathfindingAnimation) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const queue: number[][] = [];
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const parent: number[][][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  // Find start and end positions
  let start: number[] = [0, 0];
  let end: number[] = [rows - 1, cols - 1];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 2) start = [i, j];
      if (grid[i][j] === 3) end = [i, j];
    }
  }

  queue.push(start);
  visited[start[0]][start[1]] = true;

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    
    if (row === end[0] && col === end[1]) {
      // Reconstruct and animate path
      let current = parent[end[0]][end[1]]!; // Start from the parent of the end node
      while (current[0] !== start[0] || current[1] !== start[1]) {
        const [r, c] = current;
        if (grid[r][c] !== 2 && grid[r][c] !== 3) { // Don't change color of start/end nodes
          animateNode(nodes.current[r][c], COLORS.path, speed, 0, true);
        }
        current = parent[r][c]!;
        await delay(speed, isPaused, shouldStop);
      }
      onComplete();
      return;
    }

    for (const [dr, dc] of dirs) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] !== 1
      ) {
        queue.push([newRow, newCol]);
        visited[newRow][newCol] = true;
        parent[newRow][newCol] = [row, col];
        
        if (grid[newRow][newCol] !== 2 && grid[newRow][newCol] !== 3) {
          animateNode(nodes.current[newRow][newCol], COLORS.visiting, speed, 0, true);
        }
        await delay(speed, isPaused, shouldStop);
      }
    }

    if (grid[row][col] !== 2 && grid[row][col] !== 3) {
      animateNode(nodes.current[row][col], COLORS.visited, speed, 0);
    }
  }

  onComplete();
};

// Depth First Search
export const dfs = async ({
  nodes,
  grid,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: PathfindingAnimation) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const stack: number[][] = [];
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const parent: number[][][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  // Find start and end positions
  let start: number[] = [0, 0];
  let end: number[] = [rows - 1, cols - 1];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 2) start = [i, j];
      if (grid[i][j] === 3) end = [i, j];
    }
  }

  stack.push(start);
  visited[start[0]][start[1]] = true;

  while (stack.length > 0) {
    const [row, col] = stack.pop()!;
    
    if (row === end[0] && col === end[1]) {
      // Reconstruct and animate path
      let current = parent[end[0]][end[1]]!; // Start from the parent of the end node
      while (current[0] !== start[0] || current[1] !== start[1]) {
        const [r, c] = current;
        if (grid[r][c] !== 2 && grid[r][c] !== 3) { // Don't change color of start/end nodes
          animateNode(nodes.current[r][c], COLORS.path, speed, 0, true);
        }
        current = parent[r][c]!;
        await delay(speed, isPaused, shouldStop);
      }
      onComplete();
      return;
    }

    for (const [dr, dc] of dirs) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] !== 1
      ) {
        stack.push([newRow, newCol]);
        visited[newRow][newCol] = true;
        parent[newRow][newCol] = [row, col];
        
        if (grid[newRow][newCol] !== 2 && grid[newRow][newCol] !== 3) {
          animateNode(nodes.current[newRow][newCol], COLORS.visiting, speed, 0, true);
        }
        await delay(speed, isPaused, shouldStop);
      }
    }

    if (grid[row][col] !== 2 && grid[row][col] !== 3) {
      animateNode(nodes.current[row][col], COLORS.visited, speed, 0);
    }
  }

  onComplete();
};

// Dijkstra's Algorithm
export const dijkstra = async ({
  nodes,
  grid,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: PathfindingAnimation) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const dist: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const parent: number[][][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  // Find start and end positions
  let start: number[] = [0, 0];
  let end: number[] = [rows - 1, cols - 1];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 2) start = [i, j];
      if (grid[i][j] === 3) end = [i, j];
    }
  }

  dist[start[0]][start[1]] = 0;

  while (true) {
    let minDist = Infinity;
    let current: number[] | null = null;

    // Find unvisited node with minimum distance
    for (let i = 0; i < rows; i++) {
      for (let j = 0; j < cols; j++) {
        if (!visited[i][j] && dist[i][j] < minDist) {
          minDist = dist[i][j];
          current = [i, j];
        }
      }
    }

    if (!current || minDist === Infinity) break;
    const [row, col] = current;

    if (row === end[0] && col === end[1]) {
      // Reconstruct and animate path
      let current = parent[end[0]][end[1]]!; // Start from the parent of the end node
      while (current[0] !== start[0] || current[1] !== start[1]) {
        const [r, c] = current;
        if (grid[r][c] !== 2 && grid[r][c] !== 3) { // Don't change color of start/end nodes
          animateNode(nodes.current[r][c], COLORS.path, speed, 0, true);
        }
        current = parent[r][c]!;
        await delay(speed, isPaused, shouldStop);
      }
      onComplete();
      return;
    }

    visited[row][col] = true;
    if (grid[row][col] !== 2 && grid[row][col] !== 3) {
      animateNode(nodes.current[row][col], COLORS.visiting, speed, 0, true);
    }
    await delay(speed, isPaused, shouldStop);

    for (const [dr, dc] of dirs) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] !== 1
      ) {
        const newDist = dist[row][col] + 1;
        if (newDist < dist[newRow][newCol]) {
          dist[newRow][newCol] = newDist;
          parent[newRow][newCol] = [row, col];
          if (grid[newRow][newCol] !== 2 && grid[newRow][newCol] !== 3) {
            animateNode(nodes.current[newRow][newCol], COLORS.visiting, speed, 0, true);
          }
          await delay(speed, isPaused, shouldStop);
        }
      }
    }

    if (grid[row][col] !== 2 && grid[row][col] !== 3) {
      animateNode(nodes.current[row][col], COLORS.visited, speed, 0);
    }
  }

  onComplete();
};

// A* Search Algorithm
export const astar = async ({
  nodes,
  grid,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: PathfindingAnimation) => {
  const rows = grid.length;
  const cols = grid[0].length;
  const gScore: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
  const fScore: number[][] = Array(rows).fill(null).map(() => Array(cols).fill(Infinity));
  const parent: number[][][] = Array(rows).fill(null).map(() => Array(cols).fill(null));
  const openSet: number[][] = [];
  const closedSet: Set<string> = new Set();
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  // Find start and end positions
  let start: number[] = [0, 0];
  let end: number[] = [rows - 1, cols - 1];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 2) start = [i, j];
      if (grid[i][j] === 3) end = [i, j];
    }
  }

  const heuristic = (pos: number[]) => {
    return Math.abs(pos[0] - end[0]) + Math.abs(pos[1] - end[1]);
  };

  gScore[start[0]][start[1]] = 0;
  fScore[start[0]][start[1]] = heuristic(start);
  openSet.push(start);

  while (openSet.length > 0) {
    let current = openSet[0];
    let lowestFScore = fScore[current[0]][current[1]];

    // Find node with lowest fScore
    for (let i = 1; i < openSet.length; i++) {
      const score = fScore[openSet[i][0]][openSet[i][1]];
      if (score < lowestFScore) {
        current = openSet[i];
        lowestFScore = score;
      }
    }

    const [row, col] = current;

    if (row === end[0] && col === end[1]) {
      // Reconstruct and animate path
      let current = parent[end[0]][end[1]]!; // Start from the parent of the end node
      while (current[0] !== start[0] || current[1] !== start[1]) {
        const [r, c] = current;
        if (grid[r][c] !== 2 && grid[r][c] !== 3) { // Don't change color of start/end nodes
          animateNode(nodes.current[r][c], COLORS.path, speed, 0, true);
        }
        current = parent[r][c]!;
        await delay(speed, isPaused, shouldStop);
      }
      onComplete();
      return;
    }

    // Remove current from openSet
    openSet.splice(openSet.findIndex(pos => pos[0] === row && pos[1] === col), 1);
    closedSet.add(`${row},${col}`);

    if (grid[row][col] !== 2 && grid[row][col] !== 3) {
      animateNode(nodes.current[row][col], COLORS.visiting, speed, 0, true);
    }
    await delay(speed, isPaused, shouldStop);

    for (const [dr, dc] of dirs) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !closedSet.has(`${newRow},${newCol}`) &&
        grid[newRow][newCol] !== 1
      ) {
        const tentativeGScore = gScore[row][col] + 1;

        if (
          tentativeGScore < gScore[newRow][newCol] ||
          !openSet.some(pos => pos[0] === newRow && pos[1] === newCol)
        ) {
          parent[newRow][newCol] = [row, col];
          gScore[newRow][newCol] = tentativeGScore;
          fScore[newRow][newCol] = gScore[newRow][newCol] + heuristic([newRow, newCol]);

          if (!openSet.some(pos => pos[0] === newRow && pos[1] === newCol)) {
            openSet.push([newRow, newCol]);
            if (grid[newRow][newCol] !== 2 && grid[newRow][newCol] !== 3) {
              animateNode(nodes.current[newRow][newCol], COLORS.visiting, speed, 0, true);
            }
            await delay(speed, isPaused, shouldStop);
          }
        }
      }
    }

    if (grid[row][col] !== 2 && grid[row][col] !== 3) {
      animateNode(nodes.current[row][col], COLORS.visited, speed, 0);
    }
  }

  onComplete();
};

// Helper function to check if a path exists between start and end
const hasValidPath = (grid: number[][]): boolean => {
  const rows = grid.length;
  const cols = grid[0].length;
  const visited: boolean[][] = Array(rows).fill(null).map(() => Array(cols).fill(false));
  const queue: number[][] = [];
  const dirs = [[0, 1], [1, 0], [0, -1], [-1, 0]];

  // Find start position
  let start: number[] = [0, 0];
  for (let i = 0; i < rows; i++) {
    for (let j = 0; j < cols; j++) {
      if (grid[i][j] === 2) {
        start = [i, j];
        break;
      }
    }
  }

  queue.push(start);
  visited[start[0]][start[1]] = true;

  while (queue.length > 0) {
    const [row, col] = queue.shift()!;
    
    if (grid[row][col] === 3) return true;

    for (const [dr, dc] of dirs) {
      const newRow = row + dr;
      const newCol = col + dc;

      if (
        newRow >= 0 && newRow < rows &&
        newCol >= 0 && newCol < cols &&
        !visited[newRow][newCol] &&
        grid[newRow][newCol] !== 1
      ) {
        queue.push([newRow, newCol]);
        visited[newRow][newCol] = true;
      }
    }
  }

  return false;
};

// Helper function to create a path between two points
const createPath = (grid: number[][], start: number[], end: number[]) => {
  let current = [...start];
  while (current[0] !== end[0] || current[1] !== end[1]) {
    if (current[0] < end[0]) current[0]++;
    else if (current[0] > end[0]) current[0]--;
    if (current[1] < end[1]) current[1]++;
    else if (current[1] > end[1]) current[1]--;
    
    if (grid[current[0]][current[1]] === 1) {
      grid[current[0]][current[1]] = 0;
    }
  }
};

// Maze Generation Algorithms
export const recursiveDivision = (size: number): number[][] => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  grid[0][0] = 2; // Start
  grid[size - 1][size - 1] = 3; // End

  const divide = (
    startRow: number,
    endRow: number,
    startCol: number,
    endCol: number,
    orientation: 'horizontal' | 'vertical'
  ) => {
    if (endRow - startRow < 2 || endCol - startCol < 2) return;

    const horizontal = orientation === 'horizontal';
    const wall = horizontal
      ? Math.floor(Math.random() * (endRow - startRow - 1)) + startRow + 1
      : Math.floor(Math.random() * (endCol - startCol - 1)) + startCol + 1;

    const passage = horizontal
      ? Math.floor(Math.random() * (endCol - startCol + 1)) + startCol
      : Math.floor(Math.random() * (endRow - startRow + 1)) + startRow;

    if (horizontal) {
      for (let i = startCol; i <= endCol; i++) {
        if (i !== passage && grid[wall][i] !== 2 && grid[wall][i] !== 3) {
          grid[wall][i] = 1;
        }
      }
    } else {
      for (let i = startRow; i <= endRow; i++) {
        if (i !== passage && grid[i][wall] !== 2 && grid[i][wall] !== 3) {
          grid[i][wall] = 1;
        }
      }
    }

    const nextOrientation = horizontal ? 'vertical' : 'horizontal';

    if (horizontal) {
      divide(startRow, wall - 1, startCol, endCol, nextOrientation);
      divide(wall + 1, endRow, startCol, endCol, nextOrientation);
    } else {
      divide(startRow, endRow, startCol, wall - 1, nextOrientation);
      divide(startRow, endRow, wall + 1, endCol, nextOrientation);
    }
  };

  const orientation = Math.random() < 0.5 ? 'horizontal' : 'vertical';
  divide(0, size - 1, 0, size - 1, orientation);

  // Ensure there's a valid path
  if (!hasValidPath(grid)) {
    createPath(grid, [0, 0], [size - 1, size - 1]);
  }

  return grid;
};

export const horizontalDivision = (size: number): number[][] => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  grid[0][0] = 2; // Start
  grid[size - 1][size - 1] = 3; // End

  for (let i = 1; i < size - 1; i += 2) {
    const passage = Math.floor(Math.random() * size);
    for (let j = 0; j < size; j++) {
      if (j !== passage && grid[i][j] !== 2 && grid[i][j] !== 3) {
        grid[i][j] = 1;
      }
    }
  }

  // Ensure there's a valid path
  if (!hasValidPath(grid)) {
    createPath(grid, [0, 0], [size - 1, size - 1]);
  }

  return grid;
};

export const verticalDivision = (size: number): number[][] => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  grid[0][0] = 2; // Start
  grid[size - 1][size - 1] = 3; // End

  for (let j = 1; j < size - 1; j += 2) {
    const passage = Math.floor(Math.random() * size);
    for (let i = 0; i < size; i++) {
      if (i !== passage && grid[i][j] !== 2 && grid[i][j] !== 3) {
        grid[i][j] = 1;
      }
    }
  }

  // Ensure there's a valid path
  if (!hasValidPath(grid)) {
    createPath(grid, [0, 0], [size - 1, size - 1]);
  }

  return grid;
};

export const randomDivision = (size: number): number[][] => {
  const grid = Array(size).fill(null).map(() => Array(size).fill(0));
  grid[0][0] = 2; // Start
  grid[size - 1][size - 1] = 3; // End

  // Add random walls
  for (let i = 0; i < size; i++) {
    for (let j = 0; j < size; j++) {
      if (
        grid[i][j] !== 2 && 
        grid[i][j] !== 3 && 
        Math.random() < 0.3
      ) {
        grid[i][j] = 1;
      }
    }
  }

  // Ensure there's a valid path
  if (!hasValidPath(grid)) {
    createPath(grid, [0, 0], [size - 1, size - 1]);
  }

  return grid;
};
