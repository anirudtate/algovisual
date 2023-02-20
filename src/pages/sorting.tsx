import { OrbitControls } from "@react-three/drei";
import { OrbitControls as OrbitControlsImpl } from "three-stdlib";
import { Canvas, useThree } from "@react-three/fiber";
import gsap from "gsap";
import { button, Leva, LevaPanel, useControls, useCreateStore } from "leva";
import {
  createRef,
  MutableRefObject,
  useEffect,
  useRef,
  useState,
} from "react";
import { Mesh, MeshStandardMaterial } from "three";
import { create } from "zustand";
import useWindowDimensions from "./../utils/useWindowDimensions";
import Drawer from "../utils/Drawer";
import { StoreType } from "leva/dist/declarations/src/types";

interface storeState {
  isSorting: boolean;
  bars: MutableRefObject<Array<Mesh | null>>;
  baseColor: string;
  barColor: string;
  barsCount: number;
  delayTime: number;
  pause: boolean;
  swapColor: string;
  compareColor: string;
  sortedColor: string;
  array: number[];
  arrayCopy: number[];
}

const initialState = {
  pause: false,
  array: [],
  arrayCopy: [],
  delayTime: 1 / 5,
  barsCount: 10,
  isSorting: false,
  bars: createRef<Array<Mesh | null>>() as React.MutableRefObject<
    Array<Mesh | null>
  >,
  baseColor: "#111111",
  barColor: "#887777",
  swapColor: "blue",
  compareColor: "red",
  sortedColor: "green",
};

const store = create<storeState>(() => ({
  ...initialState,
}));

let levaSortStore: StoreType;

const setRefThroughArray = (array: number[]) => {
  const barsCount = store.getState().barsCount;
  const offset = ((barsCount - 1) * 1.5) / 2;
  for (let i = 0; i < barsCount; i++) {
    store
      .getState()
      .bars.current[i]?.position.set(i * 1.5 - offset, array[i] / 2, 0);
    store.getState().bars.current[i]?.scale.set(1, array[i], 1);
    setColor(i, store.getState().barColor);
  }
};

export default function Sort() {
  levaSortStore = useCreateStore();
  return (
    <Drawer>
      <div className="h-screen w-screen">
        <LevaPanel
          hideCopyButton
          titleBar={{ filter: false }}
          store={levaSortStore}
        />
        <Canvas>
          <Visualizer />
          <directionalLight position={[-0.5, 3, 5]} intensity={1.5} />
          <ambientLight intensity={0.5} />
        </Canvas>
      </div>
    </Drawer>
  );
}

function Visualizer() {
  const orbitControls = useRef<OrbitControlsImpl>(null!);
  const sorting = store((state) => state.isSorting);
  const barColor = store((state) => state.barColor);
  const baseColor = store((state) => state.baseColor);
  const barsCount = store((state) => state.barsCount);
  const [regenerate, setRegenerate] = useState(false);
  let algorithm = selectionSort;
  const barsRef = useRef<Array<Mesh | null>>([]);
  const { camera } = useThree();
  const { height, width } = useWindowDimensions();
  const [interacted, setInteracted] = useState(false);
  useEffect(() => {
    camera.position.x = 0;
    camera.position.y = barsCount / 2;
    camera.position.z = (1 / Math.min(width, height)) * 1000 * barsCount;
    orbitControls.current.target.set(0, barsCount / 3, 0);
  }, [width, height, barsCount]);

  useControls(
    "Controls",
    {
      "Play/Pause": button(() => {
        if (store.getState().isSorting) {
          store.setState({ pause: !store.getState().pause });
        } else {
          algorithm();
        }
      }),
      Reset: button(() => {
        reset();
      }),
      Regenerate: button(() => {
        setRegenerate((v) => !v);
      }),
      barsCount: {
        value: 10,
        min: 1,
        max: 100,
        step: 1,
        disabled: sorting,
        onChange: (v: number) => store.setState({ barsCount: v }),
      },
      Speed: {
        value: 5,
        min: 1,
        max: 100,
        step: 1,
        onChange: (v) => {
          store.setState({ delayTime: 1 / v });
        },
      },
      Algorithm: {
        options: {
          "Selection Sort": selectionSort,
          "Bubble Sort": bubbleSort,
          "Insertion Sort": insertionSort,
          "Merge Sort": mergeSort,
          "Quick Sort": quickSort,
        },
        disabled: sorting,
        onChange: (v: () => Promise<void>) => {
          algorithm = v;
        },
      },
    },
    { store: levaSortStore },
    [sorting]
  );
  useEffect(() => {
    store.setState({ array: [...randArray(barsCount)] });
    store.setState((state) => {
      return { arrayCopy: [...state.array] };
    });
    store.setState({ bars: barsRef });
    reset();
    return () => {
      reset();
    };
  }, [barsCount, regenerate]);
  useEffect(() => {
    const lister = () => {
      if (interacted == false) setInteracted(true);
      window.removeEventListener("mousedown", lister);
    };
    window.addEventListener("mousedown", lister);
    return () => {
      window.removeEventListener("mousedown", lister);
    };
  }, []);
  useEffect(() => {
    orbitControls.current.autoRotate = !interacted;
  }, [interacted]);

  return (
    <>
      <OrbitControls ref={orbitControls} />
      {/* BARS */}
      {[...Array(barsCount)].map((_, i) => (
        <mesh key={i} ref={(e) => (barsRef.current[i] = e)}>
          <boxBufferGeometry />
          <meshStandardMaterial color={barColor} />
        </mesh>
      ))}
      {/* BASE */}
      <mesh position={[0, -0.5 / 2, 0]} scale={[barsCount * 1.5, 0.5, 1.5]}>
        <boxBufferGeometry />
        <meshStandardMaterial color={baseColor} />
      </mesh>
      <color args={["#222222"]} attach="background" />
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
      mni = i;
    for (let j = i; j < n; j++) {
      if (dz()) return;
      await compare(mni, j);
      if (array[j] < mn) {
        mn = array[j];
        mni = j;
      }
    }
    if (mni != i) {
      await swap(i, mni, array);
    }
  }
  await setAllGreen();
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

async function setAllGreen() {
  const n = store.getState().barsCount;
  for (let i = 0; i < n; i++) {
    setColor(i, store.getState().sortedColor);
    if (await dd()) return;
  }
}

async function setAllBase() {
  const n = store.getState().barsCount;
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
        await swap(j, j + 1, array);
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
        await swap(j + 1, j, array);
      }
    }
  }
  await setAllGreen();
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

async function merge(array: number[], l: number, m: number, r: number) {
  let nl = m - l + 1,
    nr = r - m;
  let larr = [],
    rarr = [];
  for (let i = 0; i < nl; i++) larr[i] = array[l + i];
  for (let i = 0; i < nr; i++) rarr[i] = array[m + 1 + i];
  let i = 0,
    j = 0,
    k = l;
  // merge tmp arrays to real array
  while (i < nl && j < nr) {
    await compare(l + i, m + 1 + j);
    if (dz()) return;
    if (larr[i] <= rarr[j]) {
      array[k] = larr[i];
      await swapSet(k, array);
      if (dz()) return;
      i++;
    } else {
      array[k] = rarr[j];
      await swapSet(k, array);
      if (dz()) return;
      j++;
    }
    k++;
  }
  // extra elements
  while (i < nl) {
    array[k] = larr[i];
    await swapSet(k, array);
    if (dz()) return;
    i++;
    k++;
  }
  while (j < nr) {
    array[k] = rarr[j];
    await swapSet(k, array);
    if (dz()) return;
    j++;
    k++;
  }
}

async function realMergeSort(array: number[], l: number, r: number) {
  if (l < r) {
    let m = Math.floor((l + r) / 2);
    if (dz()) return;
    await realMergeSort(array, l, m);
    if (dz()) return;
    await realMergeSort(array, m + 1, r);
    if (dz()) return;
    await merge(array, l, m, r);
    if (dz()) return;
  }
}

async function mergeSort() {
  store.setState({ isSorting: true });
  await setAllBase();
  if (dz()) return;
  let array = [...store.getState().array];
  await realMergeSort(array, 0, array.length - 1);
  if (dz()) return;
  await setAllGreen();
  if (dz()) return;
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

let pi = 0;
async function partition(array: number[], l: number, r: number) {
  if (dz()) return;
  let pivot = array[r];
  let mxi = l - 1;
  for (let i = l; i < r; i++) {
    if (dz()) return;
    await compare(i, r);
    if (array[i] <= pivot) {
      mxi++;
      if (mxi != i && array[mxi] != array[i]) {
        await swap(mxi, i, array);
      }
      if (dz()) return;
    }
  }
  await swap(mxi + 1, r, array);
  if (dz()) return;
  pi = mxi + 1;
}

async function realQuickSort(array: number[], l: number, r: number) {
  if (l < r) {
    if (dz()) return;
    await partition(array, l, r);
    if (dz()) return;
    await realQuickSort(array, l, pi - 1);
    if (dz()) return;
    await realQuickSort(array, pi + 1, r);
    if (dz()) return;
  }
}

async function quickSort() {
  store.setState({ isSorting: true });
  await setAllBase();
  if (dz()) return;
  let array = [...store.getState().array];
  if (dz()) return;
  await realQuickSort(array, 0, array.length - 1);
  if (dz()) return;
  await setAllGreen();
  if (dz()) return;
  store.setState({ isSorting: false });
  store.setState({ array: [...array] });
}

function setColor(i: number, c: string) {
  (
    store.getState().bars.current[i]?.material as MeshStandardMaterial
  )?.color.set(c);
}

async function swapSet(i: number, array: number[]) {
  setColor(i, store.getState().swapColor);
  setHeight(i, array[i]);
  if (await dd()) return;
  setColor(i, store.getState().barColor);
}

async function swap(i: number, j: number, array: number[]) {
  let tmp = array[i];
  array[i] = array[j];
  array[j] = tmp;
  setColor(i, store.getState().swapColor);
  setColor(j, store.getState().swapColor);
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
  while (store.getState().pause) {
    await delay(0.5);
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
  for (let i = 0; i < length; i++) array.push(rand(1, length));
  return array;
}
