import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { ModeToggle } from "@/components/mode-toggle";
import { PlusIcon } from "@/components/icons";
import FlickeringGrid from "@/components/flickering-grid";
import { useTheme } from "@/components/theme-provider";
import { Button } from "@/components/ui/button";
import { ArrowRight, ChevronDown } from "lucide-react";
import { Footer } from "@/components/footer";

export function Home() {
  const { theme } = useTheme();
  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
      },
    },
  };

  const item = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0 },
  };

  return (
    <div className="relative min-h-screen bg-background/95 dark:bg-background/95">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 bg-transparent">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <span className="font-bold text-xl">AlgoVisual</span>
          </Link>
          <ModeToggle />
        </div>
      </nav>

      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center">
        <div className="absolute inset-0">
          <FlickeringGrid
            color={theme === "dark" ? "rgb(255, 255, 255)" : "rgb(0, 0, 0)"}
            maxOpacity={0.15}
            squareSize={4}
            gridGap={8}
            flickerChance={0.2}
            className="w-full h-full"
          />
        </div>
        <div className="container relative z-10">
          <motion.div
            variants={container}
            initial="hidden"
            animate="show"
            className="text-center h-screen flex flex-col justify-center gap-2"
          >
            <motion.div
              variants={item}
              className="space-y-6 max-w-[800px] mx-auto"
            >
              <h1 className="text-4xl sm:text-6xl font-bold tracking-tight">
                Visualize Algorithms in 3D
              </h1>
              <p className="text-xl text-muted-foreground max-w-[600px] mx-auto">
                Experience the beauty of algorithms through interactive 3D
                visualizations. Perfect for learning and understanding complex
                computational concepts.
              </p>
            </motion.div>

            <motion.div
              variants={item}
              className="mt-8 flex gap-4 justify-center flex-col md:flex-row"
            >
              <Link to="/sorting">
                <Button
                  size="lg"
                  className="text-lg px-8 py-6 border bg-primary hover:bg-primary/90"
                >
                  Sorting Visualizer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
              <Link to="/pathfinding">
                <Button
                  size="lg"
                  variant="outline"
                  className="text-lg px-8 py-6 border"
                >
                  Pathfinding Visualizer
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              </Link>
            </motion.div>

            <motion.div
              variants={item}
              className="absolute bottom-10 translate-y-1/2 left-1/2 -translate-x-1/2"
            >
              <div className="flex items-center justify-center animate-bounce">
                <ChevronDown className="w-6 h-6" />
              </div>
            </motion.div>
          </motion.div>
        </div>
      </section>

      {/* Grid Section */}
      <section className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
          {/* Sorting Visualizer Card */}
          <Link to="/sorting" className="group h-full">
            <div className="h-full border border-black/[0.1] dark:border-white/[0.1] flex flex-col items-start p-6 relative rounded-lg bg-card hover:bg-accent/40 transition-colors">
              <PlusIcon className="absolute h-6 w-6 -top-3 -left-3 text-black/40 dark:text-white/40" />
              <PlusIcon className="absolute h-6 w-6 -bottom-3 -left-3 text-black/40 dark:text-white/40" />
              <PlusIcon className="absolute h-6 w-6 -top-3 -right-3 text-black/40 dark:text-white/40" />
              <PlusIcon className="absolute h-6 w-6 -bottom-3 -right-3 text-black/40 dark:text-white/40" />

              <div className="w-full aspect-[2/1] rounded-lg overflow-hidden bg-muted mb-6">
                <img
                  src="/sorting.png"
                  alt="Sorting Visualizer Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <div className="mt-auto">
                <h3 className="text-2xl font-semibold mb-2">
                  Sorting Visualizer
                </h3>
                <p className="text-muted-foreground">
                  Watch sorting algorithms organize data in real-time with
                  beautiful 3D animations
                </p>
              </div>
            </div>
          </Link>

          {/* Pathfinding Visualizer Card */}
          <Link to="/pathfinding" className="group h-full">
            <div className="h-full border border-black/[0.1] dark:border-white/[0.1] flex flex-col items-start p-6 relative rounded-lg bg-card hover:bg-accent/40 transition-colors">
              <PlusIcon className="absolute h-6 w-6 -top-3 -left-3 text-black/40 dark:text-white/40" />
              <PlusIcon className="absolute h-6 w-6 -bottom-3 -left-3 text-black/40 dark:text-white/40" />
              <PlusIcon className="absolute h-6 w-6 -top-3 -right-3 text-black/40 dark:text-white/40" />
              <PlusIcon className="absolute h-6 w-6 -bottom-3 -right-3 text-black/40 dark:text-white/40" />

              <div className="w-full aspect-[2/1] rounded-lg overflow-hidden bg-muted mb-6">
                <img
                  src="/pathfinding.png"
                  alt="Pathfinding Visualizer Preview"
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                />
              </div>

              <div className="mt-auto">
                <h3 className="text-2xl font-semibold mb-2">
                  Pathfinding Visualizer
                </h3>
                <p className="text-muted-foreground">
                  Explore how pathfinding algorithms navigate through mazes,
                  generate random mazes, and find the shortest path
                </p>
              </div>
            </div>
          </Link>
        </div>
      </section>
      <Footer />
    </div>
  );
}
