import Head from "next/head";
import Image from "next/image";
import Link from "next/link";
import Particles from "react-tsparticles";
import { loadFull } from "tsparticles";
import type { Engine } from "tsparticles-engine";
import Drawer from "../utils/Drawer";
import Footer from "../utils/Footer";

export default function Home() {
  return (
    <>
      <Head>
        <title>AlgoVisual 3D</title>
        <meta
          name="description"
          content="A 3D platform to visualize and interact with algorithms."
        />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <Drawer>
        <section className="relative z-0 flex h-screen items-center justify-center">
          <div className="absolute m-5">
            <h1 className="text-center font-bebas text-7xl sm:text-9xl">
              Algo<span className="text-primary-focus">Visual</span>
            </h1>
            <p className="text-md text-center font-bold sm:text-xl">
              A 3D platform to visualize and interact with algorithms.
            </p>
          </div>
          <svg className="l-[50%] absolute bottom-[20px] my-auto h-[72px] w-[60px] animate-bounce">
            <path
              className="fill-transparent stroke-base-content stroke-2"
              d="M0 0 L30 32 L60 0"
            ></path>
            <path
              className="fill-transparent stroke-primary stroke-2"
              d="M0 20 L30 52 L60 20"
            ></path>
          </svg>
          <ParticlesBackground />
        </section>
        <section className="flex min-h-screen flex-col items-center justify-center md:flex-row">
          <div className="card m-2 w-80 rounded-lg border border-primary bg-base-100 shadow-xl">
            <figure>
              <Image
                className="rounded-lg p-1"
                width={400}
                height={400}
                src="/placeholder.png"
                alt=""
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">Sorting Visualizer</h2>
              <p>
                Includes sorting algorithms like selection sort, bubble sort,
                merge sort, etc.
              </p>
              <div className="card-actions justify-end">
                <Link href="/sorting">
                  <button className="btn-primary btn">Visualize</button>
                </Link>
              </div>
            </div>
          </div>
          <div className="card m-2 w-80 rounded-lg border border-primary bg-base-100 shadow-xl">
            <figure>
              <Image
                className="rounded-lg p-1"
                width={400}
                height={400}
                src="/placeholder.png"
                alt=""
              />
            </figure>
            <div className="card-body">
              <h2 className="card-title">Path-finding Visualizer</h2>
              <p>
                Includes path-finding algorithms like bfs, dfs, dijkstra&#39;s
                algorithm, etc.
              </p>
              <div className="card-actions justify-end">
                <Link href="/path-finding">
                  <button className="btn-primary btn">Visualize</button>
                </Link>
              </div>
            </div>
          </div>
        </section>
        <Footer />
      </Drawer>
    </>
  );
}

function ParticlesBackground() {
  const particlesInit = async (main: Engine) => {
    await loadFull(main);
  };
  const dotsColor = "#b4c6ef";

  return (
    <>
      <Particles
        className="h-full w-full"
        id="tsparticles"
        init={particlesInit}
        options={{
          fullScreen: false,
          particles: {
            number: {
              value: 50,
              density: {
                enable: true,
                value_area: 800,
              },
            },
            color: {
              value: dotsColor,
            },
            shape: {
              type: "circle",
              stroke: {
                width: 0,
                color: "#000000",
              },
              polygon: {
                nb_sides: 5,
              },
            },
            opacity: {
              value: 0.8,
              random: false,
              anim: {
                enable: false,
                speed: 1,
                opacity_min: 0.1,
                sync: false,
              },
            },
            size: {
              value: 7,
              random: false,
              anim: {
                enable: false,
                speed: 40,
                size_min: 0.1,
                sync: false,
              },
            },
            line_linked: {
              enable: true,
              distance: 150,
              color: dotsColor,
              opacity: 0.7,
              width: 5,
            },
            move: {
              enable: true,
              speed: 4,
              direction: "none",
              random: false,
              straight: false,
              out_mode: "out",
              bounce: false,
              attract: {
                enable: false,
                rotateX: 600,
                rotateY: 1200,
              },
            },
          },
          interactivity: {
            detect_on: "canvas",
            events: {
              onhover: {
                enable: false,
                mode: "repulse",
              },
              onclick: {
                enable: true,
                mode: "push",
              },
              resize: true,
            },
            modes: {
              grab: {
                distance: 400,
                line_linked: {
                  opacity: 1,
                },
              },
              bubble: {
                distance: 400,
                size: 40,
                duration: 2,
                opacity: 8,
                speed: 3,
              },
              repulse: {
                distance: 200,
                duration: 0.4,
              },
              push: {
                particles_nb: 4,
              },
              remove: {
                particles_nb: 2,
              },
            },
          },
          retina_detect: true,
        }}
      />
    </>
  );
}
