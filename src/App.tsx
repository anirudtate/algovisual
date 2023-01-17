import { OrbitControls } from "@react-three/drei";
import { Canvas } from "@react-three/fiber";
import gsap from "gsap";
import { button, Leva, useControls } from "leva";
import { Perf } from "r3f-perf";
import {
  createRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { create } from "zustand";
import "./App.css";

interface storeState {
  isSorting: boolean;
  bars: MutableRefObject<Array<Mesh | null>>;
  baseColor: string;
  barColor: string;
  count: number;
  delayTime: number;
  swapColor: string;
  compareColor: string;
  sortedColor: string;
  array: number[];
  arrayCopy: number[];
}
const store = create<storeState>(() => ({
  array: [],
  arrayCopy: [],
  delayTime: 1 / 10,
  count: 10,
  isSorting: false,
  bars: createRef<Array<Mesh | null>>() as React.MutableRefObject<
    Array<Mesh | null>
  >,
  baseColor: "black",
  barColor: "slategray",
  swapColor: "blue",
  compareColor: "red",
  sortedColor: "green",
}));

const setRefThroughArray = (array: number[]) => {
  const count = store.getState().count;
  const offset = ((count - 1) * 1.5) / 2;
  for (let i = 0; i < count; i++) {
    store
      .getState()
      .bars.current[i]?.position.set(i * 1.5 - offset, array[i] / 2, 0);
    store.getState().bars.current[i]?.scale.set(1, array[i], 1);
    setColor(i, store.getState().barColor);
  }
};

export default function App() {
  return (
    <div className="canvas">
      <Leva hideCopyButton={true} />
      <Canvas>
        <Perf position="top-left" />
        <Visualizer />
        <OrbitControls />
        <directionalLight position={[1, 2, 3]} intensity={1.5} />
        <directionalLight position={[-1, -2, -3]} intensity={1.5} />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  );
}

function Visualizer() {
  const sorting = store((state) => state.isSorting);
  const barColor = store((state) => state.barColor);
  const baseColor = store((state) => state.baseColor);
  const count = store((state) => state.count);
  const [regenerate, setRegenerate] = useState(false);
  let algorithm = selectionSort;
  const barsRef = useRef<Array<Mesh | null>>([]);
  useControls("Controls", {
    "sort!": button(() => {
      !sorting ? algorithm() : null;
    }),
    regenerate: button(() => {
      setRegenerate((v) => !v);
    }),
    reset: button(() => {
      reset();
    }),
    speed: {
      value: 10,
      min: 1,
      max: 100,
      step: 1,
      onChange: (v) => {
        store.setState({ delayTime: 1 / v });
      },
    },
    algorithm: {
      options: {
        "selection sort": selectionSort,
        "bubble sort": bubbleSort,
        "insertion sort": insertionSort,
        "merge sort": mergeSort,
      },
      onChange: (v: () => Promise<void>) => {
        algorithm = v;
      },
    },
  });
  useControls(
    "Customize",
    {
      count: {
        value: 10,
        min: 1,
        max: 100,
        step: 1,
        disabled: sorting,
        onChange: (v: number) => store.setState({ count: v }),
      },
    },
    {
      collapsed: true,
    },
    [sorting]
  );
  const { background } = useControls(
    "Advanced",
    {
      background: {
        value: "#242424",
      },
      barColor: {
        value: barColor,
        onChange: (v: string) => store.setState({ barColor: v }),
      },
      baseColor: {
        value: baseColor,
        onChange: (v: string) => store.setState({ baseColor: v }),
      },
      swapColor: {
        value: store.getState().swapColor,
        onChange: (v: string) => store.setState({ swapColor: v }),
      },
    },
    {
      collapsed: true,
    }
  );
  useEffect(() => {
    const array = randArray(count);
    store.setState({ array: [...array] });
    store.setState({ arrayCopy: [...array] });
    store.setState({ bars: barsRef });
    reset();
  }, [count, regenerate]);
  return (
    <>
      {/* BARS */}
      {[...Array(count)].map((_, i) => (
        <mesh key={i} ref={(e) => (barsRef.current[i] = e)}>
          <boxBufferGeometry />
          <meshStandardMaterial color={barColor} />
        </mesh>
      ))}
      {/* BASE */}
      <mesh position={[0, -0.5 / 2, 0]} scale={[count * 1.5, 0.5, 1.5]}>
        <boxBufferGeometry />
        <meshStandardMaterial color={baseColor} />
      </mesh>
      <color args={[background]} attach="background" />
    </>
  );
}

async function reset() {
  if (store.getState().isSorting) {
    store.setState({ isSorting: false });
    return;
  }
  const arrayCopy = store.getState().arrayCopy;
  store.setState({ array: [...arrayCopy] });
  setRefThroughArray(arrayCopy);
}

async function selectionSort() {
  store.setState({ isSorting: true });
  await setAllBase();
  const array = [...store.getState().array];
  const n = array.length;
  for (let i = 0; i < n - 1; i++) {
    if (dz()) return;
    let mn = n,
      mni = -1;
    for (let j = i; j < n; j++) {
      if (dz()) return;
      if (array[j] < mn) {
        mn = array[j];
        mni = j;
      }
      await compare(i, j);
    }
    if (mni != i) {
      swap(i, mni, array);
    }
  }
  await setAllGreen();
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

async function setAllGreen() {
  const n = store.getState().count;
  for (let i = 0; i < n; i++) {
    setColor(i, store.getState().sortedColor);
    if (await dd()) return;
  }
}

async function setAllBase() {
  const n = store.getState().count;
  for (let i = 0; i < n; i++) {
    setColor(i, store.getState().barColor);
  }
}

async function bubbleSort() {
  store.setState({ isSorting: true });
  await setAllBase();
  const array = [...store.getState().array];
  const n = array.length;
  for (let i = 0; i < n; i++) {
    if (dz()) return;
    for (let j = 0; j < n - i - 1; j++) {
      if (dz()) return;
      await compare(j, j + 1);
      if (array[j] > array[j + 1]) {
        swap(j, j + 1, array);
      }
    }
  }
  await setAllGreen();
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

async function insertionSort() {
  store.setState({ isSorting: true });
  await setAllBase();
  const array = [...store.getState().array];
  const n = array.length;
  for (let i = 0; i < n; i++) {
    if (dz()) return;
    for (let j = i - 1; j > -1; j--) {
      if (dz()) return;
      await compare(j, j + 1);
      if (array[j + 1] < array[j]) {
        swap(j + 1, j, array);
      }
    }
  }
  await setAllGreen();
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

async function merge(left: number[], right: number[]) {
  let result: number[] = [];
  let leftIndex = 0;
  let rightIndex = 0;

  while (leftIndex < left.length && rightIndex < right.length) {
    if (left[leftIndex] < right[rightIndex]) {
      result.push(left[leftIndex]);
      leftIndex++;
    } else {
      result.push(right[rightIndex]);
      rightIndex++;
    }
  }
  return result.concat(left.slice(leftIndex)).concat(right.slice(rightIndex));
}

async function realMergeSort(arr: number[]): Promise<number[]> {
  if (arr.length === 1) {
    return arr;
  }
  const middle = Math.floor(arr.length / 2);
  const left = arr.slice(0, middle);
  const right = arr.slice(middle);

  console.log("Splitting:", arr);
  await new Promise((resolve) => setTimeout(resolve, 1000));

  return merge(await realMergeSort(left), await realMergeSort(right));
}

async function mergeSort() {
  store.setState({ isSorting: true });
  await setAllBase();
  let array = [...store.getState().array];
  dbg(array);
  array = await realMergeSort(array);
  setRefThroughArray(array);
  dbg(array);
  await setAllGreen();
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

function setColor(i: number, c: string) {
  (
    store.getState().bars.current[i]?.material as MeshStandardMaterial
  ).color.set(c);
}

async function swap(i: number, j: number, array: number[]) {
  let tmp = array[i];
  array[i] = array[j];
  array[j] = tmp;
  setColor(i, store.getState().swapColor);
  setColor(j, store.getState().swapColor);
  if (await dd()) return;
  setHeight(i, array[i]);
  setHeight(j, array[j]);
  if (await dd()) return;
  setColor(i, store.getState().barColor);
  setColor(j, store.getState().barColor);
}

async function compare(i: number, j: number) {
  setColor(i, store.getState().compareColor);
  setColor(j, store.getState().compareColor);
  if (await dd()) return;
  if (await dd()) return;
  setColor(i, store.getState().barColor);
  setColor(j, store.getState().barColor);
}

function setHeight(i: number, h: number) {
  gsap.to(store.getState().bars.current[i]?.position as any, {
    y: h / 2,
    duration: store.getState().delayTime,
  });
  gsap.to(store.getState().bars.current[i]?.scale as any, {
    y: h,
    duration: store.getState().delayTime,
  });
}

const dd = async () => {
  if (!store.getState().isSorting) {
    reset();
    return true;
  }
  await delay(store.getState().delayTime);
  return false;
};

const dz = () => {
  if (!store.getState().isSorting) {
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

function randArray(length: number) {
  const array = new Array<number>();
  for (let i = 0; i < length; i++) array.push(rand(1, length - 2));
  return array;
}

function dbg(x: any) {
  console.log(x);
}
