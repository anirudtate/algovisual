import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import Drawer from "../utils/Drawer";
import Footer from "../utils/Footer";

const markdown = `

## Path-finding Algorithms Tutorial

Path finding algorithms are used in computer science and mathematics to find the shortest or most efficient path between two points in a network or graph.

Imagine you are trying to find the shortest route to a friend's house, but you don't know the area well. You might start by looking at a map and plotting out the different routes you could take. But how do you determine which route is the shortest or most efficient?

Path finding algorithms help to solve this problem by analyzing the different possible routes and determining the best one based on certain criteria, such as distance or time.

There are many different path finding algorithms, but some of the most common ones include Dijkstra's algorithm, A* algorithm, and the Floyd-Warshall algorithm. Each algorithm has its own strengths and weaknesses and is better suited to certain types of problems.

Overall, path finding algorithms help us to navigate complex networks and find the most efficient routes between different points.

---

## Breadth First Search

Breadth first search (BFS) is a path finding algorithm that explores a graph by visiting all the nodes at the current depth before moving on to nodes at the next depth. It is often used to find the shortest path between two nodes in an unweighted graph.

#### Here's how BFS works:

1. Start at the starting node and mark it as visited.
2. Add the starting node to a queue.
3. While the queue is not empty, do the following:
    * Remove the first node from the queue.
    * For each unvisited neighbor of the current node, mark it as visited and add it to the queue.
    * If the destination node is found, stop the search and return the path.

The BFS algorithm guarantees that the first path found between the starting node and the destination node is the shortest path.

#### Here's an example code in Python that implements BFS:

from collections import deque

    def bfs(graph, start, destination):
        visited = set()
        queue = deque([(start, [start])])

        while queue:
            node, path = queue.popleft()
            if node == destination:
                return path
            visited.add(node)
            for neighbor in graph[node]:
                if neighbor not in visited:
                    queue.append((neighbor, path + [neighbor]))

        return None

In this code, graph is a dictionary where the keys are nodes and the values are lists of the neighboring nodes. start is the starting node, and destination is the destination node.

The algorithm keeps track of visited nodes in a set and stores the path to the current node in a list. It uses a deque (double-ended queue) to implement the queue of nodes to visit.

The algorithm runs until the queue is empty, or until the destination node is found. When the destination node is found, the function returns the path to it. If the destination node cannot be reached from the starting node, the function returns None.

---

## Depth First Search

Depth-first search (DFS) is another path finding algorithm that traverses a graph by exploring as far as possible along each branch before backtracking. It is often used to explore all possible paths in a graph.

#### Here's how DFS works:

1. Start at the starting node and mark it as visited.
2. For each unvisited neighbor of the current node, do the following:
    *. Mark the neighbor as visited.
    *. Recursively call the DFS function on the neighbor.
3. If the destination node is found, stop the search and return the path.

The DFS algorithm can explore very deeply into a graph, potentially going down many levels before backtracking. This can make it less efficient than BFS for finding the shortest path in an unweighted graph.

#### Here's an example code in Python that implements DFS:

    def dfs(graph, start, destination, visited=None, path=None):
        if visited is None:
            visited = set()
        if path is None:
            path = [start]
        visited.add(start)

        if start == destination:
            return path

        for neighbor in graph[start]:
            if neighbor not in visited:
                new_path = path + [neighbor]
                result = dfs(graph, neighbor, destination, visited, new_path)
                if result is not None:
                    return result

        return None

In this code, graph is a dictionary where the keys are nodes and the values are lists of the neighboring nodes. start is the starting node, and destination is the destination node.

The algorithm keeps track of visited nodes in a set and stores the current path to the current node in a list. It recursively calls the DFS function on each unvisited neighbor of the current node until the destination node is found. When the destination node is found, the function returns the path to it. If the destination node cannot be reached from the starting node, the function returns None.

---

## Dijkstra's algorithm

Dijkstra's algorithm is a path finding algorithm that finds the shortest path between two nodes in a weighted graph. It works by iteratively selecting the unvisited node with the smallest distance to the starting node and updating the distances of its neighbors. The algorithm guarantees that the shortest path to each node is found in turn.

#### Here's how Dijkstra's algorithm works:

1. Assign a distance of 0 to the starting node and infinity to all other nodes.
2. Mark all nodes as unvisited and create an empty set of visited nodes.
3. While the destination node has not been visited, do the following:
    *. Select the unvisited node with the smallest distance to the starting node.
    *. Mark the node as visited.
    *. For each neighbor of the node, calculate the distance to the neighbor as the sum of the distance to the current node and the weight of the edge to the neighbor. If this distance is smaller than the current distance to the neighbor, update the neighbor's distance.
4. When the destination node has been visited, backtrack from the destination node to the starting node using the recorded distances to find the shortest path.

#### Here's an example code in Python that implements Dijkstra's algorithm:

    import heapq

    def dijkstra(graph, start, destination):
        # Initialize distances and visited nodes
        distances = {node: float('inf') for node in graph}
        distances[start] = 0
        visited = set()

        # Create a priority queue for unvisited nodes
        queue = [(0, start)]

        while queue:
            # Pop the node with the smallest distance from the start
            current_distance, current_node = heapq.heappop(queue)

            # If the destination is reached, return the path
            if current_node == destination:
                path = []
                while current_node != start:
                    path.append(current_node)
                    current_node = distances[current_node][1]
                path.append(start)
                return list(reversed(path))

            # Mark the node as visited
            visited.add(current_node)

            # Update the distances of the neighbors
            for neighbor, weight in graph[current_node].items():
                if neighbor not in visited:
                    new_distance = current_distance + weight
                    if new_distance < distances[neighbor]:
                        distances[neighbor] = (new_distance, current_node)
                        heapq.heappush(queue, (new_distance, neighbor))

        # If the destination is not reachable, return None
        return None

In this code, graph is a dictionary where the keys are nodes and the values are dictionaries of the neighboring nodes and their weights. start is the starting node, and destination is the destination node.

The algorithm keeps track of the distances to each node from the starting node in a dictionary called distances. It uses a priority queue implemented with a heap to select the unvisited node with the smallest distance to the starting node. When a shorter path to a node is found, the distances dictionary is updated with the new distance and the previous node on the path.

When the destination node is reached, the algorithm backtracks from the destination node to the starting node using the recorded distances to find the shortest path.

---

## A* Search

A* (pronounced "A-star") is a path finding algorithm that is similar to Dijkstra's algorithm but adds a heuristic function to guide the search towards the destination node. A* uses a combination of the actual distance from the starting node and an estimated distance to the destination node to determine the next node to visit.

#### Here's how A* works:

1. Assign a distance of 0 to the starting node and infinity to all other nodes.
2. Mark all nodes as unvisited and create an empty set of visited nodes.
3. While the destination node has not been visited, do the following:
    a. Select the unvisited node with the smallest sum of the actual distance from the starting node and the estimated distance to the destination node.
    b. Mark the node as visited.
    c. For each neighbor of the node, calculate the distance to the neighbor as the sum of the distance to the current node and the weight of the edge to the neighbor. If this distance is smaller than the current distance to the neighbor, update the neighbor's distance.
4. When the destination node has been visited, backtrack from the destination node to the starting node using the recorded distances to find the shortest path.

#### Here's an example code in Python that implements A*:

    import heapq
    import math

    def heuristic(node, destination):
        # Calculate the Euclidean distance between the node and the destination
        dx = abs(node[0] - destination[0])
        dy = abs(node[1] - destination[1])
        return math.sqrt(dx*dx + dy*dy)

    def a_star(graph, start, destination):
        # Initialize distances and visited nodes
        distances = {node: float('inf') for node in graph}
        distances[start] = 0
        visited = set()

        # Create a priority queue for unvisited nodes
        queue = [(0, start)]

        while queue:
            # Pop the node with the smallest sum of distance and heuristic
            current_distance, current_node = heapq.heappop(queue)

            # If the destination is reached, return the path
            if current_node == destination:
                path = []
                while current_node != start:
                    path.append(current_node)
                    current_node = distances[current_node][1]
                path.append(start)
                return list(reversed(path))

            # Mark the node as visited
            visited.add(current_node)

            # Update the distances of the neighbors
            for neighbor, weight in graph[current_node].items():
                if neighbor not in visited:
                    new_distance = current_distance + weight
                    if new_distance < distances[neighbor]:
                        distances[neighbor] = (new_distance, current_node)
                        priority = new_distance + heuristic(neighbor, destination)
                        heapq.heappush(queue, (priority, neighbor))

        # If the destination is not reachable, return None
        return None

In this code, graph is a dictionary where the keys are nodes and the values are dictionaries of the neighboring nodes and their weights. start is the starting node, and destination is the destination node.

The heuristic function calculates an estimated distance between two nodes, which in this case is the Euclidean distance between the nodes. The a_star function uses a priority queue implemented with a heap to select the unvisited node with the smallest sum of the actual distance and the estimated distance to the destination node.

When a shorter path to a node is found, the distances dictionary is updated with the new distance and the previous node on the path.

When the destination node is reached, the algorithm backtracks from the destination node to the starting node using the recorded distances to find the shortest path.

`;

export default function PathFindingTutorial() {
  return (
    <Drawer>
      <ReactMarkdown className="prose-lg prose w-screen p-8 pt-16 sm:prose-lg md:prose-xl">
        {markdown}
      </ReactMarkdown>
      <Footer />
    </Drawer>
  );
}
