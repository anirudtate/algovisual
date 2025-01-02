import {
  OrbitControls,
  PerspectiveCamera,
  Text,
  Stars,
} from "@react-three/drei";
import { Canvas, useThree, useFrame } from "@react-three/fiber";
import { useEffect, useRef, useState } from "react";
import { Group, Mesh, Vector3 } from "three";
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
  bubbleSort,
  selectionSort,
  insertionSort,
  mergeSort,
  quickSort,
  resetBarColors,
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
import { motion } from "framer-motion";

interface SortingState {
  array: number[];
  isSorting: boolean;
  isPaused: boolean;
  speed: number;
  algorithm: string;
  barCount: number;
  setArray: (array: number[]) => void;
  setIsSorting: (isSorting: boolean) => void;
  setIsPaused: (isPaused: boolean) => void;
  setSpeed: (speed: number) => void;
  setAlgorithm: (algorithm: string) => void;
  setBarCount: (barCount: number) => void;
}

const useStore = create<SortingState>((set) => ({
  array: [],
  isSorting: false,
  isPaused: false,
  speed: 10,
  algorithm: "bubble",
  barCount: 10,
  setArray: (array) => set({ array }),
  setIsSorting: (isSorting) => set({ isSorting }),
  setIsPaused: (isPaused) => set({ isPaused }),
  setSpeed: (speed) => set({ speed }),
  setAlgorithm: (algorithm) => set({ algorithm }),
  setBarCount: (barCount) => set({ barCount }),
}));

const algorithms = {
  bubble: bubbleSort,
  selection: selectionSort,
  insertion: insertionSort,
  merge: mergeSort,
  quick: quickSort,
};

const algorithmInfo = {
  bubble: { name: "Bubble Sort", complexity: "O(n²)" },
  selection: { name: "Selection Sort", complexity: "O(n²)" },
  insertion: { name: "Insertion Sort", complexity: "O(n²)" },
  merge: { name: "Merge Sort", complexity: "O(n log n)" },
  quick: { name: "Quick Sort", complexity: "O(n log n)" },
};

const barsRef = { current: [] as (Mesh | null)[] };
const textsRef = { current: [] as (Group | null)[] };
const beamsRef = { current: [] as (Mesh | null)[] };

export default function SortingVisualizer() {
  const [controlOpen, setControlOpen] = useState(true);
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
          <div className="p-4 space-y-4">
            <div className="flex items-center gap-1 border-b pb-2">
              <h2 className="text-lg font-semibold">Sorting Visualizer</h2>
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
              <Controls />
            </motion.div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Controls() {
  const {
    isSorting,
    isPaused,
    speed,
    algorithm,
    barCount,
    array,
    setSpeed,
    setAlgorithm,
    setBarCount,
    setIsSorting,
    setIsPaused,
    setArray,
  } = useStore();

  const pauseRef = useRef(false);
  const shouldStopRef = useRef(false);
  const speedRef = useRef(speed);

  useEffect(() => {
    speedRef.current = speed;
  }, [speed]);

  const handleStart = async () => {
    if (isSorting) {
      pauseRef.current = !isPaused;
      setIsPaused(!isPaused);
    } else {
      setIsSorting(true);
      pauseRef.current = false;
      shouldStopRef.current = false;
      setIsPaused(false);
      await algorithms[algorithm as keyof typeof algorithms]({
        array,
        bars: barsRef,
        texts: textsRef,
        beams: beamsRef,
        speed: speedRef,
        isPaused: pauseRef,
        shouldStop: shouldStopRef,
        onComplete: () => {
          setIsSorting(false);
          setIsPaused(false);
          pauseRef.current = false;
        },
      });
    }
  };

  const generateArray = () => {
    shouldStopRef.current = true; // Signal the sorting to stop
    const newArray = Array.from(
      { length: barCount },
      () => Math.floor(Math.random() * barCount) + 1,
    );
    setArray(newArray);
    setIsSorting(false);
    setIsPaused(false);
    pauseRef.current = false;

    // Reset colors to default
    resetBarColors(barsRef, textsRef, beamsRef, newArray);
  };

  useEffect(() => {
    generateArray();
  }, [barCount]);

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
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
              disabled={isSorting}
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
              <label className="text-sm font-medium">Array Size</label>
              <span className="text-xs text-muted-foreground">
                {barCount} elements
              </span>
            </div>
            <Slider
              value={[barCount]}
              onValueChange={(value) => setBarCount(value[0])}
              min={5}
              max={50}
              step={5}
              disabled={isSorting}
            />
          </div>

          <div className="space-y-2">
            <div className="flex justify-between items-center">
              <label className="text-sm font-medium">Speed</label>
              <span className="text-xs text-muted-foreground">{speed}x</span>
            </div>
            <Slider
              value={[speed]}
              onValueChange={(value) => setSpeed(value[0])}
              min={1}
              max={20}
              step={1}
            />
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <Button
          onClick={handleStart}
          className="flex-1"
          size="default"
          variant={isPaused ? "outline" : "default"}
        >
          {!isSorting ? "Start Sorting" : isPaused ? "Resume" : "Pause"}
        </Button>
        <Button
          onClick={generateArray}
          size="default"
          variant="outline"
          disabled={isSorting && !isPaused}
        >
          Generate New Array
        </Button>
      </div>
    </div>
  );
}

function Scene() {
  const { array, barCount } = useStore();
  const { camera } = useThree();
  const groupRef = useRef<Group>(null);
  const timeRef = useRef(0);

  useEffect(() => {
    camera.position.set(0, 10, barCount * 3);
    camera.lookAt(0, 0, 0);
  }, [camera, barCount]);

  useFrame(({ camera }, delta) => {
    timeRef.current += delta;
    // Make all text elements face the camera
    textsRef.current.forEach((textGroup) => {
      if (textGroup) {
        textGroup.lookAt(camera.position);
      }
    });
  });

  return (
    <>
      <color attach="background" args={["#000814"]} />

      <PerspectiveCamera
        makeDefault
        position={[barCount * 2, barCount * 0.8, barCount * 2]}
      />
      <OrbitControls
        enableDamping
        dampingFactor={0.05}
        minDistance={10}
        maxDistance={barCount * 6}
        maxPolarAngle={Math.PI / 2.1}
        target={new Vector3(0, 2, 0)}
      />

      {/* Scene lighting */}
      <directionalLight
        position={[10, 30, 10]}
        intensity={0.8}
        color="#ffffff"
      />
      <directionalLight
        position={[-10, 30, -10]}
        intensity={0.6}
        color="#4a9eff"
      />
      <pointLight position={[20, 15, 20]} intensity={0.5} color="#4a9eff" />
      <pointLight position={[-20, 15, -20]} intensity={0.5} color="#00ff88" />
      <spotLight
        position={[0, 30, 0]}
        angle={0.5}
        penumbra={1}
        intensity={0.8}
        color="#ffffff"
      />
      <ambientLight intensity={0.3} />

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

      {/* Minimal circular base */}
      <group position={[0, -0.5, 0]}>
        {/* Main circle */}
        <mesh rotation={[-Math.PI / 2, 0, 0]}>
          <circleGeometry args={[barCount * 1.1, 64]} />
          <meshPhongMaterial color="#000814" transparent opacity={0.6} />
        </mesh>

        {/* Subtle outer ring */}
        <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
          <ringGeometry args={[barCount * 1.08, barCount * 1.1, 64]} />
          <meshBasicMaterial color="#4f46e5" transparent opacity={0.2} />
        </mesh>
      </group>

      {/* Main visualization group */}
      <group ref={groupRef} position={[0, 0, 0]}>
        {array.map((height, index) => {
          const offset = ((barCount - 1) * 1.5) / 2;
          const x = index * 1.5 - offset;

          return (
            <group key={index} position={[x, 0, 0]}>
              {/* Energy beam under each bar */}
              <mesh
                ref={(el) => (beamsRef.current[index] = el)}
                position={[0, 0, 0]}
                scale={[0.15, height + 0.5, 0.15]}
              >
                <cylinderGeometry args={[1, 0, 1, 8]} />
                <meshPhongMaterial
                  color="#4a9eff"
                  emissive="#4a9eff"
                  emissiveIntensity={0.5}
                  transparent
                  opacity={0.6}
                />
              </mesh>

              {/* Main bar */}
              <mesh
                ref={(el) => (barsRef.current[index] = el)}
                position={[0, height / 2, 0]}
                scale={[1, height, 1]}
              >
                <boxGeometry />
                <meshPhysicalMaterial
                  color="#4a9eff"
                  emissive="#4a9eff"
                  emissiveIntensity={0.3}
                  metalness={0.6}
                  roughness={0.2}
                  clearcoat={0.5}
                  clearcoatRoughness={0.3}
                />
              </mesh>

              {/* Value display */}
              <group
                ref={(el) => (textsRef.current[index] = el)}
                position={[0, height + 1, 0]}
              >
                <Text
                  fontSize={1.2}
                  color="#4a9eff"
                  anchorX="center"
                  anchorY="middle"
                  userData={{ value: height }}
                >
                  {height}
                </Text>
              </group>
            </group>
          );
        })}
      </group>
    </>
  );
}
