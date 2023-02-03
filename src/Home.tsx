import { Link } from "react-router-dom";

export default function Home() {
  return (
    <div>
      <Link to="sorting">Sorting Visualizer</Link>
      <br />
      <Link to="path-finding">path-finding Visualizer</Link>
    </div>
  )
}
