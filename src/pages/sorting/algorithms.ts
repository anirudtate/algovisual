import { MutableRefObject } from "react";
import { Mesh, Group } from "three";
import gsap from "gsap";
import * as THREE from "three";

interface SortingAnimation {
  bars: MutableRefObject<(Mesh | null)[]>;
  texts: MutableRefObject<(Group | null)[]>;
  beams: MutableRefObject<(Mesh | null)[]>;
  array: number[];
  speed: MutableRefObject<number>;
  onComplete: () => void;
  isPaused: MutableRefObject<boolean>;
  shouldStop: MutableRefObject<boolean>;
}

const COLORS = {
  default: "#4f46e5",    // Indigo
  comparing: "#f59e0b",  // Amber
  swapping: "#22c55e",   // Green
  sorted: "#8b5cf6",     // Purple
  traversing: "#06b6d4", // Cyan
  pivot: "#ef4444",      // Red
  merging: "#ec4899",    // Pink
};

export const resetBarColors = (
  bars: MutableRefObject<(Mesh | null)[]>,
  texts: MutableRefObject<(Group | null)[]>,
  beams: MutableRefObject<(Mesh | null)[]>,
  array: number[]
) => {
  array.forEach((height, index) => {
    animateBar(bars.current[index], texts.current[index], beams.current[index], height, COLORS.default, { current: 10 });
  });
};

const delay = async (
  speedRef: MutableRefObject<number>,
  isPaused: MutableRefObject<boolean>,
  shouldStop: MutableRefObject<boolean>
) => {
  while (isPaused.current && !shouldStop.current) {
    await new Promise(resolve => setTimeout(resolve, 100));
  }
  if (shouldStop.current) {
    throw new Error('Sorting stopped');
  }
  const duration = 1 / speedRef.current;
  return new Promise(resolve => setTimeout(resolve, duration * 1000));
};

const animateBar = (
  bar: Mesh | null,
  text: Group | null,
  beam: Mesh | null,
  height: number,
  color: string,
  speedRef: MutableRefObject<number>
) => {
  if (!bar) return;

  const duration = 1 / speedRef.current;
  const scaledHeight = height;

  gsap.to(bar.position, {
    y: scaledHeight / 2,
    duration,
  });

  gsap.to(bar.scale, {
    y: scaledHeight,
    duration,
  });

  const newColor = new THREE.Color(color);
  
  // Update bar color and emissive
  gsap.to((bar.material as THREE.MeshPhongMaterial).color, {
    r: newColor.r,
    g: newColor.g,
    b: newColor.b,
    duration,
  });
  gsap.to((bar.material as THREE.MeshPhongMaterial).emissive, {
    r: newColor.r * 0.5,
    g: newColor.g * 0.5,
    b: newColor.b * 0.5,
    duration,
  });
  gsap.to((bar.material as THREE.MeshPhongMaterial), {
    emissiveIntensity: 1,
    duration,
  });

  if (text) {
    gsap.to(text.position, {
      y: scaledHeight + 1,
      duration,
    });
    // Update text value and color
    const textMesh = text.children[0];
    if (textMesh) {
      (textMesh as any).text = height.toString();
      textMesh.userData.value = height;
      (textMesh as any).color = color;
    }
  }

  if (beam) {
    gsap.to(beam.scale, {
      y: scaledHeight,
      duration,
    });
    
    // Update beam color and emissive
    gsap.to((beam.material as THREE.MeshPhongMaterial).color, {
      r: newColor.r,
      g: newColor.g,
      b: newColor.b,
      duration,
    });
    gsap.to((beam.material as THREE.MeshPhongMaterial).emissive, {
      r: newColor.r * 0.5,
      g: newColor.g * 0.5,
      b: newColor.b * 0.5,
      duration,
    });
    gsap.to((beam.material as THREE.MeshPhongMaterial), {
      emissiveIntensity: 1,
      duration,
    });
  }
};

export async function bubbleSort({
  bars,
  texts,
  beams,
  array,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: SortingAnimation) {
  const n = array.length;
  try {
    for (let i = 0; i < n - 1; i++) {
      for (let j = 0; j < n - i - 1; j++) {
        // Show traversal color first
        await animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.traversing, speed);
        await delay(speed, isPaused, shouldStop);
        
        // Then show comparison colors
        await Promise.all([
          animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.comparing, speed),
          animateBar(bars.current[j + 1], texts.current[j + 1], beams.current[j + 1], array[j + 1], COLORS.comparing, speed),
        ]);
        await delay(speed, isPaused, shouldStop);

        if (array[j] > array[j + 1]) {
          // Swap animation
          const temp = array[j];
          array[j] = array[j + 1];
          array[j + 1] = temp;

          await Promise.all([
            animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.swapping, speed),
            animateBar(bars.current[j + 1], texts.current[j + 1], beams.current[j + 1], array[j + 1], COLORS.swapping, speed),
          ]);
          await delay(speed, isPaused, shouldStop);
        }

        // Reset to default color
        await Promise.all([
          animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.default, speed),
          animateBar(bars.current[j + 1], texts.current[j + 1], beams.current[j + 1], array[j + 1], COLORS.default, speed),
        ]);
      }
      // Mark as sorted
      await animateBar(
        bars.current[n - i - 1],
        texts.current[n - i - 1],
        beams.current[n - i - 1],
        array[n - i - 1],
        COLORS.sorted,
        speed
      );
    }
    await animateBar(bars.current[0], texts.current[0], beams.current[0], array[0], COLORS.sorted, speed);
    onComplete();
  } catch (error) {
    console.log('Sorting stopped');
  }
}

export async function selectionSort({
  bars,
  texts,
  beams,
  array,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: SortingAnimation) {
  const n = array.length;
  try {
    for (let i = 0; i < n - 1; i++) {
      let minIdx = i;
      
      // Show current position being processed
      await animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.traversing, speed);
      await delay(speed, isPaused, shouldStop);

      for (let j = i + 1; j < n; j++) {
        // Show element being compared
        await animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.comparing, speed);
        await delay(speed, isPaused, shouldStop);

        if (array[j] < array[minIdx]) {
          // Reset previous minimum
          await animateBar(bars.current[minIdx], texts.current[minIdx], beams.current[minIdx], array[minIdx], 
            minIdx === i ? COLORS.traversing : COLORS.default, speed);
          
          minIdx = j;
          // Highlight new minimum
          await animateBar(bars.current[minIdx], texts.current[minIdx], beams.current[minIdx], array[minIdx], COLORS.swapping, speed);
        } else {
          // Reset compared element if not minimum
          await animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.default, speed);
        }
      }

      if (minIdx !== i) {
        // Perform swap
        const temp = array[i];
        array[i] = array[minIdx];
        array[minIdx] = temp;

        await Promise.all([
          animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.swapping, speed),
          animateBar(bars.current[minIdx], texts.current[minIdx], beams.current[minIdx], array[minIdx], COLORS.swapping, speed),
        ]);
        await delay(speed, isPaused, shouldStop);
      }

      // Mark current position as sorted
      await animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.sorted, speed);
      
      // Reset any remaining highlighted bars
      if (minIdx !== i) {
        await animateBar(bars.current[minIdx], texts.current[minIdx], beams.current[minIdx], array[minIdx], COLORS.default, speed);
      }
    }
    
    // Mark the last element as sorted
    await animateBar(bars.current[n - 1], texts.current[n - 1], beams.current[n - 1], array[n - 1], COLORS.sorted, speed);
    onComplete();
  } catch (error) {
    console.log('Sorting stopped');
  }
}

export async function insertionSort({
  bars,
  texts,
  beams,
  array,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: SortingAnimation) {
  const n = array.length;
  try {
    // Mark first element as sorted
    await animateBar(bars.current[0], texts.current[0], beams.current[0], array[0], COLORS.sorted, speed);

    for (let i = 1; i < n; i++) {
      // Show current element being processed
      await animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.traversing, speed);
      await delay(speed, isPaused, shouldStop);
      
      const key = array[i];
      let j = i - 1;

      // Compare with sorted portion
      while (j >= 0 && array[j] > key) {
        // Highlight comparison
        await animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.comparing, speed);
        await delay(speed, isPaused, shouldStop);
        
        // Shift element
        array[j + 1] = array[j];
        await animateBar(bars.current[j + 1], texts.current[j + 1], beams.current[j + 1], array[j], COLORS.swapping, speed);
        
        // Reset color of processed element
        await animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.sorted, speed);
        
        j--;
      }

      // Place key in its correct position
      array[j + 1] = key;
      await animateBar(bars.current[j + 1], texts.current[j + 1], beams.current[j + 1], key, COLORS.swapping, speed);
      await delay(speed, isPaused, shouldStop);
      
      // Mark all elements up to i as sorted
      for (let k = 0; k <= i; k++) {
        await animateBar(bars.current[k], texts.current[k], beams.current[k], array[k], COLORS.sorted, speed);
      }
    }

    onComplete();
  } catch (error) {
    console.log('Sorting stopped');
  }
}

export async function mergeSort({
  bars,
  texts,
  beams,
  array,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: SortingAnimation) {
  async function merge(left: number, middle: number, right: number) {
    const n1 = middle - left + 1;
    const n2 = right - middle;
    const L = array.slice(left, middle + 1);
    const R = array.slice(middle + 1, right + 1);

    // Highlight the subarrays being merged
    for (let i = left; i <= right; i++) {
      await animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.merging, speed);
    }
    await delay(speed, isPaused, shouldStop);

    let i = 0, j = 0, k = left;

    while (i < n1 && j < n2) {
      // Highlight elements being compared
      await Promise.all([
        animateBar(bars.current[left + i], texts.current[left + i], beams.current[left + i], L[i], COLORS.comparing, speed),
        animateBar(bars.current[middle + 1 + j], texts.current[middle + 1 + j], beams.current[middle + 1 + j], R[j], COLORS.comparing, speed)
      ]);
      await delay(speed, isPaused, shouldStop);

      if (L[i] <= R[j]) {
        array[k] = L[i];
        await animateBar(bars.current[k], texts.current[k], beams.current[k], L[i], COLORS.swapping, speed);
        i++;
      } else {
        array[k] = R[j];
        await animateBar(bars.current[k], texts.current[k], beams.current[k], R[j], COLORS.swapping, speed);
        j++;
      }
      k++;
    }

    while (i < n1) {
      array[k] = L[i];
      await animateBar(bars.current[k], texts.current[k], beams.current[k], L[i], COLORS.swapping, speed);
      i++;
      k++;
    }

    while (j < n2) {
      array[k] = R[j];
      await animateBar(bars.current[k], texts.current[k], beams.current[k], R[j], COLORS.swapping, speed);
      j++;
      k++;
    }

    // Mark the merged subarray as sorted
    for (let i = left; i <= right; i++) {
      await animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.sorted, speed);
    }
  }

  async function sort(left: number, right: number) {
    if (left < right) {
      const middle = Math.floor((left + right) / 2);
      
      // Highlight the current subarray being processed
      for (let i = left; i <= right; i++) {
        await animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.traversing, speed);
      }
      await delay(speed, isPaused, shouldStop);

      await sort(left, middle);
      await sort(middle + 1, right);
      await merge(left, middle, right);
    }
  }

  try {
    await sort(0, array.length - 1);
    onComplete();
  } catch (error) {
    console.log('Sorting stopped');
  }
}

export async function quickSort({
  bars,
  texts,
  beams,
  array,
  speed,
  onComplete,
  isPaused,
  shouldStop,
}: SortingAnimation) {
  async function partition(low: number, high: number): Promise<number> {
    const pivot = array[high];
    
    // Highlight pivot element
    await animateBar(bars.current[high], texts.current[high], beams.current[high], pivot, COLORS.pivot, speed);
    await delay(speed, isPaused, shouldStop);

    let i = low - 1;

    // Highlight the subarray being processed
    for (let k = low; k <= high; k++) {
      await animateBar(bars.current[k], texts.current[k], beams.current[k], array[k], COLORS.traversing, speed);
    }
    await delay(speed, isPaused, shouldStop);

    for (let j = low; j < high; j++) {
      // Highlight current element being compared
      await animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.comparing, speed);
      await delay(speed, isPaused, shouldStop);

      if (array[j] <= pivot) {
        i++;
        // Swap elements
        const temp = array[i];
        array[i] = array[j];
        array[j] = temp;

        if (i !== j) {
          await Promise.all([
            animateBar(bars.current[i], texts.current[i], beams.current[i], array[i], COLORS.swapping, speed),
            animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.swapping, speed)
          ]);
          await delay(speed, isPaused, shouldStop);
        }
      }
      
      // Reset color
      await animateBar(bars.current[j], texts.current[j], beams.current[j], array[j], COLORS.traversing, speed);
    }

    // Place pivot in correct position
    const temp = array[i + 1];
    array[i + 1] = array[high];
    array[high] = temp;

    await Promise.all([
      animateBar(bars.current[i + 1], texts.current[i + 1], beams.current[i + 1], array[i + 1], COLORS.swapping, speed),
      animateBar(bars.current[high], texts.current[high], beams.current[high], array[high], COLORS.swapping, speed)
    ]);
    await delay(speed, isPaused, shouldStop);

    // Mark pivot position as sorted
    await animateBar(bars.current[i + 1], texts.current[i + 1], beams.current[i + 1], array[i + 1], COLORS.sorted, speed);

    return i + 1;
  }

  async function sort(low: number, high: number) {
    if (low < high) {
      const pi = await partition(low, high);
      await sort(low, pi - 1);
      await sort(pi + 1, high);
    } else if (low === high) {
      // Single element is always sorted
      await animateBar(bars.current[low], texts.current[low], beams.current[low], array[low], COLORS.sorted, speed);
    }
  }

  try {
    await sort(0, array.length - 1);
    onComplete();
  } catch (error) {
    console.log('Sorting stopped');
  }
}
