import { ReactMarkdown } from "react-markdown/lib/react-markdown";
import Drawer from "../utils/Drawer";
import Footer from "../utils/Footer";

const markdown = `
## Sorting Algorithms Tutorial

Sorting algorithms are algorithms that arrange elements in a list or array in a particular order, such as ascending or descending order. The elements could be anything, such as numbers, strings, or objects.

There are many different sorting algorithms, each with its own advantages and disadvantages depending on the size of the data set, the distribution of the data, and other factors.

Sorting is an important task in computer science and is used in many applications, such as search algorithms, database management systems, and data analysis.

Some common sorting algorithms include:

- Selection sort
- Bubble sort
- Insertion sort
- Merge sort
- Quick sort

Each of these algorithms has its own approach to sorting the elements in the list, and they vary in terms of efficiency and performance for different types of data sets.

Knowing and understanding different sorting algorithms can be useful when developing software applications, as well as for solving algorithmic problems and challenges.

---

## Selection Sort

Selection sort is a simple sorting algorithm that works by repeatedly finding the smallest element from an unsorted list and moving it to the front of the list.

#### Here is how it works:
1. Find the smallest element in the list.
2. Swap it with the first element in the list.
3. Repeat steps 1 and 2 for the rest of the list, but exclude the already sorted elements.

This process of finding the smallest element and moving it to the front of the list is repeated until the entire list is sorted.

For example, let's say we have an unsorted list of integers:

    [5, 2, 7, 3, 9, 1]

First, we find the smallest element, which is 1. We swap it with the first element in the list, which gives us:

    [1, 2, 7, 3, 9, 5]

Next, we find the smallest element in the remaining unsorted list (excluding the already sorted elements), which is 2. We swap it with the second element in the list, which gives us:

    [1, 2, 7, 3, 9, 5]

We continue this process until the entire list is sorted:

    [1, 2, 3, 5, 7, 9]

Here's the Python code for selection sort:

    def selection_sort(arr):
        for i in range(len(arr)):
            min_idx = i
            for j in range(i + 1, len(arr)):
                if arr[j] < arr[min_idx]:
                    min_idx = j
            arr[i], arr[min_idx] = arr[min_idx], arr[i]
        return arr

Selection sort is not very efficient for large data sets, as it requires multiple passes through the list. However, it is easy to understand and implement, and can be useful for small data sets or as a building block for more complex sorting algorithms.

---

## Bubble Sort

Bubble sort is a simple sorting algorithm that works by repeatedly swapping adjacent elements in a list if they are in the wrong order. This process is repeated until the list is sorted.

#### Here is how it works:

1. Starting from the first element in the list, compare each adjacent pair of elements.
2. If the elements are in the wrong order (i.e., the first element is greater than the second), swap them.
3. Move on to the next pair of adjacent elements and repeat step 2.
4. Continue this process for the entire list, making multiple passes through the list if necessary, until no more swaps are needed.

The idea behind bubble sort is to move the largest elements to the end of the list on each pass. This is why it is called bubble sort - the larger elements "bubble up" to the top of the list.

For example, let's say we have an unsorted list of integers:

    [5, 2, 7, 3, 9, 1]

On the first pass, we compare the adjacent elements and swap them if necessary:

    [2, 5, 3, 7, 1, 9]

On the second pass, we continue to compare and swap adjacent elements:

    [2, 3, 5, 1, 7, 9]

We continue this process until the list is sorted:

    [1, 2, 3, 5, 7, 9]

Here's the Python code for bubble sort:

    def bubble_sort(arr):
        n = len(arr)
        for i in range(n):
            for j in range(n - i - 1):
                if arr[j] > arr[j + 1]:
                    arr[j], arr[j + 1] = arr[j + 1], arr[j]
        return arr

Bubble sort is not very efficient for large data sets, as it requires multiple passes through the list and many comparisons and swaps. However, it is easy to understand and implement, and can be useful for small data sets or as a building block for more complex sorting algorithms.

---

## Insertion Sort

Insertion sort is a simple sorting algorithm that works by sorting a list one element at a time. It starts by assuming that a list with a single element is already sorted, and then compares each subsequent element with the elements that came before it, inserting it into the correct position in the sorted list.

#### Here is how it works:

1. Starting with the second element in the list, compare it with the element(s) before it.
2. If the element before it is greater, move it one position up and compare it with the next previous element.
3. Continue this process until the element is in the correct position in the sorted list.
4. Move on to the next element in the list and repeat steps 2-3 until the entire list is sorted.

For example, let's say we have an unsorted list of integers:

    [5, 2, 7, 3, 9, 1]

On the first iteration, we start with the second element (2) and compare it with the first element (5). Since 2 is less than 5, we move 5 one position up and insert 2 in its correct position:

    [2, 5, 7, 3, 9, 1]

On the second iteration, we move to the third element (7) and compare it with the elements before it. 7 is greater than 5, so we leave it in place:

    [2, 5, 7, 3, 9, 1]

On the third iteration, we move to the fourth element (3) and compare it with the elements before it. 3 is less than 7 and 5, so we move them one position up and insert 3 in its correct position:


We continue this process until the list is sorted:

    [2, 5, 7, 3, 9, 1]
         |
         v
    [2, 5, 3, 7, 9, 1]
            |
            v
    [2, 3, 5, 7, 9, 1]
               |
               v
    [2, 3, 5, 7, 9, 1]
                  |
                  v
    [1, 2, 3, 5, 7, 9]

Here's the Python code for insertion sort:

    def insertion_sort(arr):
        for i in range(1, len(arr)):
            current_value = arr[i]
            j = i - 1
            while j >= 0 and arr[j] > current_value:
                arr[j+1] = arr[j]
                j -= 1
            arr[j+1] = current_value
        return arr

Insertion sort is efficient for small data sets or nearly sorted data sets, as it requires relatively few comparisons and swaps. However, it can be slow for larger data sets, as it requires up to O(n^2) comparisons and swaps in the worst case.

---

## Merge Sort

Merge sort is a divide-and-conquer algorithm that sorts a list by dividing it into smaller sub-lists, sorting those sub-lists, and then merging them back together in the correct order. It is a recursive algorithm, meaning that it calls itself on smaller sub-lists until the sub-lists are small enough to be sorted directly.

#### Here is how it works:

1. Divide the unsorted list into n sub-lists, each containing one element (a list of one element is considered sorted).
2. Repeatedly merge sub-lists to produce new sorted sub-lists until there is only one sub-list remaining. This will be the sorted list.

For example, let's say we have an unsorted list of integers:

    [5, 2, 7, 3, 9, 1]

To sort this list using merge sort, we first divide it into smaller sub-lists:

    [5, 2, 7] [3, 9, 1]

We then recursively sort each of these sub-lists by dividing them further:

    [5] [2, 7] [3] [9] [1]

    [5] [2] [7] [3] [9] [1]

    [2, 5] [3, 7] [1, 9]

Finally, we merge these sorted sub-lists back together to get the final sorted list:

    [1, 2, 3, 5, 7, 9]

Here's the Python code for merge sort:

    def merge_sort(arr):
        if len(arr) <= 1:
            return arr
        midpoint = len(arr) // 2
        left_half = arr[:midpoint]
        right_half = arr[midpoint:]
        left_half = merge_sort(left_half)
        right_half = merge_sort(right_half)
        return merge(left_half, right_half)

    def merge(left_half, right_half):
        result = []
        i = 0
        j = 0
        while i < len(left_half) and j < len(right_half):
            if left_half[i] <= right_half[j]:
                result.append(left_half[i])
                i += 1
            else:
                result.append(right_half[j])
                j += 1
        result += left_half[i:]
        result += right_half[j:]
        return result

Merge sort has a time complexity of O(n log n), making it more efficient than bubble sort, insertion sort, and selection sort for larger data sets. However, it requires extra memory to store the sub-lists during the sorting process, which can make it less efficient than other algorithms for very large data sets.

---

## Quick Sort

Quick sort is a divide-and-conquer algorithm that works by selecting a "pivot" element from an unsorted list, partitioning the other elements into two sub-lists according to whether they are less than or greater than the pivot, and then recursively repeating the process on the two sub-lists until the entire list is sorted. It is an efficient, in-place, comparison-based algorithm that has a worst-case time complexity of O(n^2), but typically performs much faster than other O(n^2) sorting algorithms such as selection sort and insertion sort.

#### Here is how it works:

1. Choose a "pivot" element from the list.
2. Reorder the list so that all elements with values less than the pivot come before the pivot, while all elements with values greater than the pivot come after it (equal values can go either way).
3 .Recursively apply the above steps to the sub-list of elements with smaller values and separately to the sub-list of elements with greater values.

The base case of the recursion is lists of size zero or one, which are always sorted.

For example, let's say we have an unsorted list of integers:

    [5, 2, 7, 3, 9, 1]

To sort this list using quick sort, we first choose a pivot element. For simplicity, we can choose the first element in the list:

    pivot = 5

We then reorder the list so that all elements with values less than the pivot come before it, while all elements with values greater than the pivot come after it:

    [2, 3, 1, 5, 7, 9]

We can now recursively apply the above steps to the sub-list of elements with smaller values and separately to the sub-list of elements with greater values. We repeat the process until the entire list is sorted:

    [2, 3, 1] [7, 9]

    [1, 2, 3] [5] [7, 9]

    [1, 2, 3, 5, 7, 9]

Here's the Python code for quick sort:

    def quick_sort(arr):
        if len(arr) <= 1:
            return arr
        else:
            pivot = arr[0]
            less_than_pivot = [x for x in arr[1:] if x <= pivot]
            greater_than_pivot = [x for x in arr[1:] if x > pivot]
            return quick_sort(less_than_pivot) + [pivot] + quick_sort(greater_than_pivot)

Quick sort has an average time complexity of O(n log n), which makes it more efficient than bubble sort, insertion sort, and selection sort for larger data sets. However, it has a worst-case time complexity of O(n^2), which can occur when the list is already sorted or nearly sorted.

`;

export default function SortingTutorial() {
  return (
    <Drawer>
      <ReactMarkdown className="prose-lg prose w-screen p-8 pt-16 sm:prose-lg md:prose-xl">
        {markdown}
      </ReactMarkdown>
      <Footer />
    </Drawer>
  );
}
