import Link from "next/link";
import { useRouter } from "next/router";

export default function Drawer({ children }) {
  const { route } = useRouter();
  return (
    <div
      className={
        route == "/sorting-tutorial" || route == "/path-finding-tutorial"
          ? "drawer-mobile drawer"
          : "drawer"
      }
    >
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-200 font-roboto text-base-content">
        <label
          htmlFor="my-drawer"
          className="btn-outline drawer-button btn-square btn fixed top-2 left-2 z-50"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth="2"
              d="M4 6h16M4 12h16M4 18h7"
            />
          </svg>
        </label>
        {route == "/sorting" && <SortingHelp />}
        {route == "/path-finding" && <PathFindingHelp />}
        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu w-80 bg-base-100 p-4 text-base-content">
          {!(
            route == "/sorting-tutorial" || route == "/path-finding-tutorial"
          ) && (
            <li>
              <label
                htmlFor="my-drawer"
                className="btn-outline drawer-button btn-square btn m-2 ml-auto align-bottom"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-6 w-6"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </label>
            </li>
          )}
          <li>
            <Link href="/">Home Page</Link>
          </li>
          <li>
            <Link href="/sorting">Sorting Visualizer</Link>
          </li>
          <li>
            <Link href="/path-finding">Path-finding Visualizer</Link>
          </li>
          <li>
            <Link href="/sorting-tutorial">Sorting Algorithms Tutorial</Link>
          </li>
          <li>
            <Link href="/path-finding-tutorial">
              Path-finding Algorithms Tutorial
            </Link>
          </li>
        </ul>
      </div>
    </div>
  );
}

function SortingHelp() {
  return (
    <>
      <label
        htmlFor="my-modal"
        className="btn-outline drawer-button btn-square btn fixed top-2 left-16 z-50 text-lg font-bold"
      >
        ?
      </label>
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className="modal z-[10000]">
        <div className="modal-box relative">
          <label
            htmlFor="my-modal"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <div className="prose">
            <h2>How to use?</h2>
            <p>
              This page visualizes various sorting algorithms which are use to
              sort an array in no decreasing order. To learn more about sorting
              algorithms visit{" "}
              <Link href="/sorting-tutorial" className="link font-bold">
                sorting algorithms tutorial.
              </Link>{" "}
              This page contains a <b className="text-base-content">3D scene</b>{" "}
              and a <b className="text-base-content">Controller</b>.
            </p>
            <p>
              The <b className="text-base-content">3D scene</b> consists of a
              group of{" "}
              <b className="text-base-content">
                bars that represent values in an array
              </b>
              . Each bar has a different height, which corresponds to its value.
              While <b className="text-base-content">comparing</b> bars turn{" "}
              <b className="text-red-500">red</b> and while{" "}
              <b className="text-base-content">swapping</b> bars turn{" "}
              <b className="text-blue-500">blue</b>. Use{" "}
              <b className="text-base-content">scroll</b> to{" "}
              <b className="text-base-content">zoom</b> in / out and{" "}
              <b className="text-base-content">click + drag</b> to{" "}
              <b className="text-base-content">rotate</b> the scene.
            </p>
            <p>
              The <b className="text-base-content">Controller</b> contains all
              the options required to control this scene,{" "}
              <b className="text-base-content">
                hover over each to options to learn more about it
              </b>
              .
            </p>
            <p></p>
          </div>
        </div>
      </div>
    </>
  );
}

function PathFindingHelp() {
  return (
    <>
      <label
        htmlFor="my-modal"
        className="btn-outline drawer-button btn-square btn fixed top-2 left-16 z-50"
      >
        ?
      </label>
      <input type="checkbox" id="my-modal" className="modal-toggle" />
      <div className="modal z-[10000]">
        <div className="modal-box relative">
          <label
            htmlFor="my-modal"
            className="btn-sm btn-circle btn absolute right-2 top-2"
          >
            ✕
          </label>
          <div className="prose">
            <h2>How to use?</h2>
            <p>
              This page visualizes various path-finding algorithms which are use
              to find a path in a grid which also has walls. To learn more about
              path-finding algorithms visit{" "}
              <Link href="/path-finding-tutorial" className="link font-bold">
                path-finding algorithms tutorial.
              </Link>{" "}
              This page contains a <b className="text-base-content">3D scene</b>{" "}
              and a <b className="text-base-content">Controller</b>.
            </p>
            <p>
              The <b className="text-base-content">3D scene</b> consists of a{" "}
              <b className="text-base-content">grid</b>. This grid has a{" "}
              <b className="text-base-content">start node</b>,{" "}
              <b className="text-base-content">end node</b> and{" "}
              <b className="text-base-content">walls</b> which are represented
              using <b className="text-red-500">red</b>,{" "}
              <b className="text-green-500">green</b> and{" "}
              <b className="text-blue-500">blue</b> colors respectively. While
              finding the path{" "}
              <b className="text-base-content">visited nodes</b> turn{" "}
              <b className="text-cyan-500">cyan</b> and{" "}
              <b className="text-base-content">path</b> is colored with{" "}
              <b className="text-yellow-500">yellow</b>. Use{" "}
              <b className="text-base-content">scroll</b> to{" "}
              <b className="text-base-content">zoom</b> in / out and{" "}
              <b className="text-base-content">click + drag</b> to{" "}
              <b className="text-base-content">rotate</b> the scene.
            </p>
            <p>
              The <b className="text-base-content">Controller</b> contains all
              the options required to control this scene,{" "}
              <b className="text-base-content">
                hover over each to options to learn more about it
              </b>
              .
            </p>
            <p></p>
          </div>
        </div>
      </div>
    </>
  );
}
