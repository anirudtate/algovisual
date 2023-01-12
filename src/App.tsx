import { OrbitControls } from '@react-three/drei'
import { Canvas } from '@react-three/fiber'
import { button, useControls } from 'leva';
import { Perf } from 'r3f-perf';
import { MutableRefObject, useEffect, useRef } from 'react';
import { BoxGeometry, Color, InstancedMesh, Material, Matrix4, Mesh, MeshStandardMaterial, Object3D } from 'three';
import './App.css'

const BASEHEIGHT = 0.5;
const BASECOLOR = "black";
const BARCOLOR = "gray";
const BASEMATERIAL = new MeshStandardMaterial({ color: BASECOLOR });
const BARMATERIAL = new MeshStandardMaterial({ color: BARCOLOR });
const BOXGEOMETRY = new BoxGeometry();
const color = new Color();
let bars: MutableRefObject<Array<Mesh|null>>;
let barMaterials: MutableRefObject<Array<MeshStandardMaterial|null>>;
let array: Array<number> = [];

export default function App() {
  return (
    <div className='canvas'>
      <Canvas>
        <Perf position="top-left"/>
        <Visualizer />
        <OrbitControls />
        <directionalLight position={[1, 2, 3]} intensity={1.5} />
        <directionalLight position={[-1, -2, -3]} intensity={1.5} />
        <ambientLight intensity={0.5} />
      </Canvas>
    </div>
  )
}

// function Box() {
//   const ref = useRef<Array<Mesh|null>>([]);
//   const material = useRef<Array<MeshStandardMaterial|null>>([]);
//   useEffect(()=>{
//     if (material.current && material.current[1]) {
//       material.current[1].color = color.set("red");
//       material.current[1].needsUpdate = true;
//     }
//   },[])
//   return (
//     <>
//     <mesh position={[1,0,0]} ref={el=>ref.current[0]=el}>
//       <boxBufferGeometry />
//       <meshStandardMaterial ref={el=>material.current[0]=el} color="blue" />
//     </mesh>
//     <mesh position={[-1,0,0]} ref={el=>ref.current[1]=el}>
//       <boxBufferGeometry />
//       <meshStandardMaterial ref={el=>material.current[1]=el} color="blue" />
//     </mesh>
//     </>
//   )
// }

let delayTime=0.5/10;
function Visualizer() {
  bars = useRef<Array<Mesh|null>>([]);
  barMaterials = useRef<Array<MeshStandardMaterial|null>>([]);
  const { count } = useControls({
    count: {
      value: 10,
      min: 1,
      max: 100,
      step: 1,
    },
    speed: {
      value: 3,
      min: 1,
      max: 100,
      step: 1,
      onChange: ((v: number)=>{ delayTime=0.5/v }),
    },
    selectionSort: button(() => { selectionSort() })
  })
  array=randArray(count);
  useEffect(() => {
    array = randArray(count);
    const offset = ((count - 1) * 1.5) / 2;
    for(let i=0;i<count;i++){
      bars.current[i]?.position.set((i * 1.5) - offset, array[i] / 2, 0);
      bars.current[i]?.scale.set(1, array[i], 1);
      barMaterials.current[i]?.color.set(BARCOLOR);
    }
  }, [count])
  return (
    <>
      {/* BARS */}
      {array.map((value,i)=>(
        <mesh key={i} ref={e => bars.current[i]=e}>
          <boxBufferGeometry />
          <meshStandardMaterial color={BARCOLOR} ref={e=>barMaterials.current[i]=e}/>
        </mesh>
      ))}
      {/* BASE */}
      <mesh
        position={[0, -BASEHEIGHT / 2, 0]}
        scale={[count * 1.5, BASEHEIGHT, 1.5]}
        geometry={BOXGEOMETRY}
        material={BASEMATERIAL}
      />
    </>
  )
}

async function selectionSort() {
  dbg(delayTime);
  const n = array.length;
  for (let i = 0; i < n; i++) {
    let mn = n, mni = -1;
    for (let j = i; j < n; j++) {
      setColor(i, "blue")
      setColor(j, "blue")
      await delay(delayTime);
      if (array[j] < mn) {
        mn = array[j];
        mni = j;
      }
      await delay(delayTime);
      setColor(i, BARCOLOR)
      setColor(j, BARCOLOR)
    }
    // swap
    let tmp = array[i];
    array[i] = array[mni];
    array[mni] = tmp;
    setColor(i, "blue")
    setColor(mni, "blue")
    await delay(delayTime);
    setHeight(i, array[i]);
    setHeight(mni, array[mni]);
    await delay(delayTime);
    setColor(mni, BARCOLOR)
    setColor(i, "green")
  }
}

function setColor(i: number, c: string) {
  barMaterials.current[i]?.color.set(c);
}

function setHeight(i: number, h: number) {
  bars.current[i]?.position.setY(h/2);
  bars.current[i]?.scale.setY(h);
}
const delay = (s: number) => new Promise(
  resolve => setTimeout(resolve, s * 1000)
);

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
