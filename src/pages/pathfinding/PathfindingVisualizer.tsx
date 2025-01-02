import { OrbitControls, Stars } from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Mesh } from "three";
import { create } from "zustand";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Card } from "@/components/ui/card";
import {
  bfs,
  dfs,
  dijkstra,
  astar,
  resetNodeColors,
  recursiveDivision,
  horizontalDivision,
  verticalDivision,
  randomDivision,
} from "./algorithms";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, MoreHorizontal } from "lucide-react";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { Vector3 } from "three";
import { motion } from "framer-motion";

interface PathfindingState {
  grid: number[][];
  isFinding: boolean;
  isPaused: boolean;
  speed: number;
  algorithm: string;
  gridSize: number;
  mazeAlgorithm: string;
  setGrid: (grid: number[][]) => void;
  setIsFinding: (isFinding: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setSpeed: (speed: number) => void;
  setAlgorithm: (algorithm: string) => void;
  setGridSize: (gridSize: number) => void;
  setMazeAlgorithm: (mazeAlgorithm: string) => void;
}

const useStore = create<PathfindingState>((set) => ({
  grid: [],
  isFinding: false,
  isPaused: false,
  speed: 10,
  algorithm: "bfs",
  gridSize: 10,
  mazeAlgorithm: "recursive",
  setGrid: (grid) => set({ grid }),
  setIsFinding: (isFinding) => set({ isFinding }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setSpeed: (speed) => set({ speed }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  setGridSize: (gridSize) => set({ gridSize }),
  setMazeAlgorithm: (mazeAlgorithm) => set({ mazeAlgorithm }),
}));

const algorithms = {
  bfs,
  dfs,
  dijkstra,
  astar,
};

const algorithmInfo = {
  bfs: { name: "Breadth First Search", complexity: "O(V + E)" },
  dfs: { name: "Depth First Search", complexity: "O(V + E)" },
  dijkstra: { name: "Dijkstra's Algorithm", complexity: "O((V + E) log V)" },
  astar: { name: "A* Search", complexity: "O(E)" },
};

const mazeAlgorithms = {
  recursive: recursiveDivision,
  horizontal: horizontalDivision,
  vertical: verticalDivision,
  random: randomDivision,
};

const mazeInfo = {
  recursive: "Recursive Division",
  horizontal: "Horizontal Division",
  vertical: "Vertical Division",
  random: "Random Division",
};

const nodesRef = { current: [] as (Mesh | null)[][] };

export default function PathfindingVisualizer() {
  return (
    <div className="relative h-screen w-screen overflow-hidden">
      {/* Full screen canvas */}
      <div className="absolute inset-0">
        <Canvas>
          <Scene />
        </Canvas>
      </div>

      {/* Compact overlay controls */}
      <div className="absolute left-4 top-4 z-10">
        <Card className="w-[350px] border bg-background/95 backdrop-blur-md shadow-lg">
          <Controls />
        </Card>
      </div>
    </div>
  );
}

function Controls() {
  const {
    grid,
    setGrid,
    isFinding,
    setIsFinding,
    isPaused,
    setIsPaused,
    speed,
    setSpeed,
    algorithm,
    setAlgorithm,
    gridSize,
    setGridSize,
    mazeAlgorithm,
    setMazeAlgorithm,
  } = useStore();

  const speedRef = useRef(speed);
  const isPausedRef = useRef(isPaused);
  const shouldStopRef = useRef(false);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const handleVisualize = async () => {
    if (isFinding) {
      isPausedRef.current = !isPaused;
      setIsPaused(!isPaused);
    } else {
      setIsFinding(true);
      isPausedRef.current = false;
      shouldStopRef.current = false;
      setIsPaused(false);
      try {
        const selectedAlgorithm =
          algorithms[algorithm as keyof typeof algorithms];
        if (!selectedAlgorithm) {
          throw new Error(`Algorithm ${algorithm} not found`);
        }

        await selectedAlgorithm({
          nodes: nodesRef,
          grid,
          speed: speedRef,
          onComplete: () => {
            setIsFinding(false);
            setIsPaused(false);
            isPausedRef.current = false;
          },
          isPaused: isPausedRef,
          shouldStop: shouldStopRef,
        });
      } catch (error) {
        console.error("Pathfinding error:", error);
        setIsFinding(false);
        setIsPaused(false);
        // Reset node colors on error
        resetNodeColors(nodesRef, grid);
      }
    }
  };

  const generateMaze = (paramMazeAlgorithm?: string) => {
    const ma = paramMazeAlgorithm || mazeAlgorithm;
    const newGrid = mazeAlgorithms[ma as keyof typeof mazeAlgorithms](gridSize);
    setGrid(newGrid);
    resetNodeColors(nodesRef, newGrid);
  };

  const [controlOpen, setControlOpen] = useState(true);

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-1 border-b pb-2 p-4">
        <h2 className="text-lg font-semibold">Pathfinding Visualizer</h2>
        <div className="flex-1" />
        <ModeToggle buttonVariant="outline" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="icon">
              <MoreHorizontal className="h-4 w-4" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem asChild>
              <Link to="/">Home</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/sorting">Sorting Visualizer</Link>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <Link to="/pathfinding">Pathfinding Visualizer</Link>
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button
          variant="outline"
          size="icon"
          onClick={() => {
            setControlOpen(!controlOpen);
          }}
        >
          <motion.div
            animate={{
              rotate: controlOpen ? 180 : 0,
            }}
          >
            <ChevronDown />
          </motion.div>
        </Button>
      </div>

      <motion.div
        animate={{
          height: controlOpen ? "auto" : "0",
          overflow: "hidden",
        }}
      >
        <div className="space-y-4 p-4">
          <div className="space-y-3 flex-1">
            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Algorithm</label>
                <span className="text-xs text-muted-foreground">
                  Time Complexity:{" "}
                  {
                    algorithmInfo[algorithm as keyof typeof algorithmInfo]
                      .complexity
                  }
                </span>
              </div>
              <Select
                value={algorithm}
                onValueChange={setAlgorithm}
                disabled={isFinding && !isPaused}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Algorithm" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(algorithmInfo).map(([key, info]) => (
                    <SelectItem key={key} value={key}>
                      {info.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Grid Size</label>
                <span className="text-xs text-muted-foreground">
                  {gridSize}x{gridSize} cells
                </span>
              </div>
              <Slider
                value={[gridSize]}
                onValueChange={([value]) => {
                  setGridSize(value);
                  generateMaze(); // Regenerate maze when grid size changes
                }}
                min={5}
                max={50}
                step={5}
                disabled={isFinding && !isPaused}
              />
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Maze Type</label>
              </div>
              <Select
                value={mazeAlgorithm}
                onValueChange={(value) => {
                  setMazeAlgorithm(value);
                  generateMaze(value);
                }}
                disabled={isFinding && !isPaused}
              >
                <SelectTrigger className="h-9">
                  <SelectValue placeholder="Select Maze Type" />
                </SelectTrigger>
                <SelectContent>
                  {Object.entries(mazeInfo).map(([key, name]) => (
                    <SelectItem key={key} value={key}>
                      {name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center">
                <label className="text-sm font-medium">Speed</label>
                <span className="text-xs text-muted-foreground">{speed}x</span>
              </div>
              <Slider
                value={[speed]}
                onValueChange={([value]) => setSpeed(value)}
                min={1}
                max={20}
                step={1}
              />
            </div>
          </div>

          <div className="flex gap-2 flex-col">
            <Button
              onClick={handleVisualize}
              className="flex-1"
              size="default"
              variant={isPaused ? "outline" : "default"}
            >
              {!isFinding ? "Start Pathfinding" : isPaused ? "Resume" : "Pause"}
            </Button>
            <Button
              onClick={() => {
                shouldStopRef.current = true; // Signal the pathfinding to stop
                generateMaze();
              }}
              size="default"
              variant="outline"
              disabled={isFinding && !isPaused}
            >
              Generate New Maze
            </Button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

function Scene() {
  const { camera } = useThree();
  const { grid, setGrid, gridSize } = useStore();
  const controlsRef = useRef<any>(null);
  const timeRef = useRef(0);
  const groupRef = useRef<Group>(null);

  useEffect(() => {
    const newGrid = mazeAlgorithms.recursive(gridSize);
    setGrid(newGrid);

    // Position camera to view the entire grid
    const distance = Math.max(gridSize * 1.5, 10);
    camera.position.set(distance, 10, distance);
    camera.lookAt(0, 0, 0);
  }, [gridSize]);

  useFrame((_, delta) => {
    timeRef.current += delta;
    controlsRef.current?.update();
  });

  const handleNodeClick = (row: number, col: number) => {
    if (grid[row][col] !== 1) {
      const newGrid = [...grid];
      newGrid[row][col] = 1;
      setGrid(newGrid);
    } else {
      const newGrid = [...grid];
      newGrid[row][col] = 0;
      setGrid(newGrid);
    }
  };

  return (
    <>
      <color attach="background" args={["#000814"]} />

      <OrbitControls
        ref={controlsRef}
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={gridSize * 6}
        maxPolarAngle={Math.PI / 2.1}
        target={new Vector3(0, 2, 0)}
      />

      {/* Scene lighting */}
      <directionalLight
        position={[1, 2, 3]}
        intensity={1.2}
        castShadow
        shadow-mapSize-width={2048}
        shadow-mapSize-height={2048}
      />
      <directionalLight position={[-5, 5, -5]} intensity={0.5} />
      <ambientLight intensity={0.6} />
      <pointLight position={[0, 10, 0]} intensity={0.3} />

      {/* Starfield background */}
      <Stars
        radius={100}
        depth={50}
        count={5000}
        factor={4}
        saturation={0}
        fade
        speed={1}
      />

      {/* Base platform */}
      <group position={[0, -0.1, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[gridSize * 1.5, gridSize * 1.5]} />
          <meshPhongMaterial color="#1a1a2e" />
        </mesh>
        <gridHelper
          args={[gridSize * 1.5, gridSize * 1.5, "#4f46e5", "#4f46e5"]}
          position={[0, 0.01, 0]}
        />
      </group>

      <group position={[0, -0.35, 0]}>
        <mesh rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <boxGeometry args={[gridSize * 1.5, gridSize * 1.5, 0.5]} />
          <meshPhongMaterial color="#1a1a2e" />
        </mesh>
      </group>

      {/* Grid visualization */}
      <group
        ref={groupRef}
        position={[-(gridSize - 1) / 2, 0, -(gridSize - 1) / 2]}
      >
        {grid.map((row, i) =>
          row.map((cell, j) => {
            const height = 0.8;
            const y = cell === 1 || cell === 3 || cell === 2 ? 0.1 : -0.4;
            return (
              <group key={`${i}-${j}`} position={[i, y, j]}>
                {/* Node */}
                <mesh
                  ref={(el) => {
                    if (!nodesRef.current[i]) nodesRef.current[i] = [];
                    nodesRef.current[i][j] = el;
                  }}
                  position={[0, 0, 0]}
                  onClick={(e) => {
                    e.stopPropagation();
                    handleNodeClick(i, j);
                  }}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                  castShadow
                  receiveShadow
                >
                  <boxGeometry args={[0.8, height, 0.8]} />
                  <meshPhongMaterial
                    color={
                      cell === 2
                        ? "#ef4444" // Start - Pure Red
                        : cell === 3
                          ? "#15803d" // End - Forest Green
                          : cell === 1
                            ? "#312e81" // Wall - Deep Indigo
                            : "#93c5fd" // Normal - Light Blue
                    }
                    shininess={30}
                    specular="#404040"
                    emissive={
                      cell === 2
                        ? "#ef4444"
                        : cell === 3
                          ? "#15803d"
                          : "#000000"
                    }
                    emissiveIntensity={0.3}
                  />
                </mesh>

                {/* Base plate */}
                <mesh position={[0, -0.05, 0]} receiveShadow>
                  <boxGeometry args={[0.9, 0, 0.9]} />
                  <meshPhongMaterial
                    color="#4f46e5"
                    transparent
                    opacity={0.2}
                    shininess={10}
                  />
                </mesh>
              </group>
            );
          }),
        )}
      </group>
    </>
  );
}
