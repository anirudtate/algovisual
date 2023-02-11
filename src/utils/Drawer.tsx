import Link from "next/link";

export default function Drawer({ children }) {
  return (
    <div className="drawer">
      <input id="my-drawer" type="checkbox" className="drawer-toggle" />
      <div className="drawer-content bg-base-100 text-base-content font-roboto">
        <label htmlFor="my-drawer" className="fixed top-2 left-2 btn drawer-button btn-square btn-outline z-50">
          <svg xmlns="http://www.w3.org/2000/svg" className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h7" />
          </svg>
        </label>
        {children}
      </div>
      <div className="drawer-side">
        <label htmlFor="my-drawer" className="drawer-overlay"></label>
        <ul className="menu p-4 w-80 bg-base-100 text-base-content">
          <li><label htmlFor="my-drawer" className="m-2 btn btn-square btn-outline drawer-button align-bottom ml-auto">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
          </label></li>
          <li><Link href="/">Home Page</Link></li>
          <li><Link href="/sorting">Sorting Visualizer</Link></li>
          <li><Link href="/path-finding">Path-finding Visualizer</Link></li>
        </ul>
      </div>
    </div>
  )
}
