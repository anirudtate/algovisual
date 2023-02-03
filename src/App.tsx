import { Route, Routes } from "react-router-dom";
import Home from "./Home";
import Path from "./Path";
import Sort from "./Sort";

export default function App() {
  return (
  <Routes>
      <Route path="/sorting" element={<Sort />}/>
      <Route path="/" element={<Home />}/>
      <Route path="/path-finding" element={<Path />}/>
    </Routes>
  )
}
