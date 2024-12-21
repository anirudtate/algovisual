import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./global.css";
import { ThemeProvider } from "@/components/theme-provider";
import { createBrowserRouter, RouterProvider } from "react-router-dom";
import { Toaster } from "./components/ui/toaster";
import { Home } from "./pages/home";
import SortingVisualizer from "./pages/sorting/SortingVisualizer";
import PathfindingVisualizer from "./pages/pathfinding/PathfindingVisualizer";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Home />,
  },
  {
    path: "/sorting",
    element: <SortingVisualizer />,
  },
  {
    path: "/pathfinding",
    element: <PathfindingVisualizer />,
  },
]);

createRoot(document.getElementById("root")!).render(<App />);

function App() {
  return (
    <StrictMode>
      <ThemeProvider defaultTheme="dark" storageKey="vite-ui-theme">
        <RouterProvider router={router} />
        <Toaster />
      </ThemeProvider>
    </StrictMode>
  );
}
