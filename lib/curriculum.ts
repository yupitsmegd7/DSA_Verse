import { javaExamples } from "./java";
export type Topic = {
  id: string;
  title: string;
  group: string;
  minutes: number;
  summary: string;
  analogy: string;
  steps: string[];
  pitfall: string;
  complexity: string;
  code: { Python: string; C: string; Java: string };
  problems: { title: string; slug: string; difficulty: "Easy" | "Medium" }[];
};
const t = (
  id: string,
  title: string,
  group: string,
  summary: string,
  analogy: string,
  steps: string[],
  pitfall: string,
  complexity: string,
  py: string,
  c: string,
  problems: [string, string, "Easy" | "Medium"][],
): Topic => ({
  id,
  title,
  group,
  minutes: 20,
  summary,
  analogy,
  steps,
  pitfall,
  complexity,
  code: { Python: py, C: c, Java: javaExamples[id] },
  problems: problems.map(([title, slug, difficulty]) => ({
    title,
    slug,
    difficulty,
  })),
});
export const topics: Topic[] = [
  t(
    "complexity",
    "Time & space complexity",
    "Foundations",
    "Measure how an algorithm grows before you try to make it faster.",
    "Painting one tile takes constant work. Painting every tile in a row is linear. Painting every tile of an n × n wall is quadratic.",
    [
      "Define n: the size of the input, not its numeric value.",
      "Count how often the dominant operation runs. Consecutive loops add; nested independent loops multiply.",
      "Drop constant factors and smaller terms. Count extra memory separately, including the call stack.",
    ],
    "Two nested loops are not always O(n²): their bounds matter. A loop that doubles its index is logarithmic.",
    "A single scan: O(n) time, O(1) extra space.",
    "def total(a):\n    s = 0\n    for x in a:\n        s += x\n    return s",
    "int total(int a[], int n) {\n    int s = 0;\n    for (int i=0; i<n; i++) s += a[i];\n    return s;\n}",
    [
      ["Running Sum of 1d Array", "running-sum-of-1d-array", "Easy"],
      ["Contains Duplicate", "contains-duplicate", "Easy"],
    ],
  ),
  t(
    "arrays",
    "Arrays & strings",
    "Foundations",
    "Use indices, boundaries, and a running state to work with sequences.",
    "Think of an array as a row of numbered paint pots. The position lets you reach a pot immediately.",
    [
      "Use indices 0 through n−1. Read a value by index in constant time.",
      "Choose the state needed while scanning: a sum, count, best value, or previous value.",
      "Test an empty array, one item, repeated items, and the final index.",
    ],
    "An array index is a position, not the value stored there. Never access a[n].",
    "Index access O(1); scanning O(n); insertion at the front O(n).",
    "def largest(a):\n    if not a: return None\n    best = a[0]\n    for x in a:\n        best = max(best, x)\n    return best",
    "int largest(int a[], int n) {\n    int best = a[0]; /* n must be > 0 */\n    for (int i=1; i<n; i++)\n        if (a[i] > best) best = a[i];\n    return best;\n}",
    [
      [
        "Best Time to Buy and Sell Stock",
        "best-time-to-buy-and-sell-stock",
        "Easy",
      ],
      ["Maximum Subarray", "maximum-subarray", "Medium"],
    ],
  ),
  t(
    "hashing",
    "Hash maps & sets",
    "Foundations",
    "Trade some extra space for fast lookup, counting, and matching.",
    "A labelled pigment drawer lets you find a colour without checking every drawer.",
    [
      "Use a set when only presence matters; use a map when each key has a value.",
      "For a target pair, calculate the missing complement before inserting the current value.",
      "Store frequencies when duplicate values matter. Account for extra space.",
    ],
    "Checking the complement after inserting can accidentally use the same element twice.",
    "Expected O(1) lookup; a full pass O(n) time and O(n) space. Worst-case hash lookup can be O(n).",
    "def two_sum(a, target):\n    seen = {}\n    for i, x in enumerate(a):\n        if target-x in seen:\n            return [seen[target-x], i]\n        seen[x] = i",
    "/* Frequency table for values 0..99 */\nvoid count(int a[], int n, int f[100]) {\n    for (int i=0; i<100; i++) f[i]=0;\n    for (int i=0; i<n; i++) f[a[i]]++;\n}",
    [
      ["Two Sum", "two-sum", "Easy"],
      ["Group Anagrams", "group-anagrams", "Medium"],
    ],
  ),
  t(
    "pointers",
    "Two pointers",
    "Patterns",
    "Move two indices deliberately to avoid trying every pair.",
    "Two curators approach a row of paintings from opposite ends, each move eliminating work.",
    [
      "Check whether the input is sorted or can be sorted without losing required positions.",
      "Maintain left and right boundaries. Use the current comparison to discard one side.",
      "Stop when pointers meet; state why the move cannot skip a valid answer.",
    ],
    "The sum-based pointer rule needs sorted input. Sorting also changes the original indices.",
    "O(n) time and O(1) extra space for an already sorted array.",
    "def pair(a, target):\n    l, r = 0, len(a)-1\n    while l < r:\n        s = a[l]+a[r]\n        if s == target: return [l,r]\n        if s < target: l += 1\n        else: r -= 1",
    "int hasPair(int a[], int n, int target) {\n    int l=0, r=n-1;\n    while (l<r) {\n        int s=a[l]+a[r];\n        if (s==target) return 1;\n        if (s<target) l++; else r--;\n    }\n    return 0;\n}",
    [
      ["Valid Palindrome", "valid-palindrome", "Easy"],
      ["3Sum", "3sum", "Medium"],
    ],
  ),
  t(
    "window",
    "Sliding window",
    "Patterns",
    "Reuse work across overlapping contiguous sections of an array or string.",
    "Move a small frame across a mural. Only the piece entering and leaving the frame changes.",
    [
      "For fixed size k, build the first window.",
      "Move one step: subtract the outgoing value and add the incoming value.",
      "For variable windows, expand right and shrink left until your invariant holds.",
    ],
    "A simple sum-based variable window may fail with negative values because sums are no longer monotonic.",
    "Fixed-size window O(n) time, O(1) extra space.",
    "def best_window(a, k):\n    s = best = sum(a[:k])\n    for i in range(k, len(a)):\n        s += a[i] - a[i-k]\n        best = max(best, s)\n    return best",
    "int bestWindow(int a[], int n, int k) {\n    int s=0; /* 1 <= k <= n */\n    for (int i=0; i<k; i++) s+=a[i];\n    int best=s;\n    for (int i=k; i<n; i++) {\n        s+=a[i]-a[i-k];\n        if (s>best) best=s;\n    }\n    return best;\n}",
    [
      ["Maximum Average Subarray I", "maximum-average-subarray-i", "Easy"],
      [
        "Longest Substring Without Repeating Characters",
        "longest-substring-without-repeating-characters",
        "Medium",
      ],
    ],
  ),
  t(
    "search",
    "Binary search",
    "Patterns",
    "Halve a sorted search space with a precise boundary rule.",
    "Find a painting in a sorted catalogue by opening the middle, then keeping just the useful half.",
    [
      "Start with inclusive boundaries l=0 and r=n−1.",
      "Calculate mid=l+(r−l)/2. Compare a[mid] with the target.",
      "Return on equality; otherwise set l=mid+1 or r=mid−1. Stop when l>r.",
    ],
    "Mixing inclusive and exclusive bounds causes off-by-one bugs. Also check the empty input.",
    "O(log n) time, O(1) iterative extra space.",
    "def search(a, target):\n    l, r = 0, len(a)-1\n    while l <= r:\n        m = (l+r)//2\n        if a[m] == target: return m\n        if a[m] < target: l=m+1\n        else: r=m-1\n    return -1",
    "int search(int a[], int n, int x) {\n    int l=0, r=n-1;\n    while (l<=r) {\n        int m=l+(r-l)/2;\n        if (a[m]==x) return m;\n        if (a[m]<x) l=m+1; else r=m-1;\n    }\n    return -1;\n}",
    [
      ["Binary Search", "binary-search", "Easy"],
      [
        "Search in Rotated Sorted Array",
        "search-in-rotated-sorted-array",
        "Medium",
      ],
    ],
  ),
  t(
    "linked",
    "Linked lists",
    "Data structures",
    "Rewire connections while preserving access to every node.",
    "Each sketch carries a note pointing to the next one. You follow the notes instead of numbered slots.",
    [
      "A node stores a value and a next pointer. Traversal starts at the head.",
      "For reversal, save next before changing current.next.",
      "Advance previous and current, then return previous as the new head.",
    ],
    "Changing next before saving it loses the remaining list. Check null and one-node lists.",
    "Traversal/reversal O(n) time; iterative reversal O(1) extra space.",
    "def reverse(head):\n    prev = None\n    while head:\n        nxt = head.next\n        head.next = prev\n        prev, head = head, nxt\n    return prev",
    "struct Node { int val; struct Node *next; };\nstruct Node *reverse(struct Node *h) {\n    struct Node *p=0, *n;\n    while (h) {\n        n=h->next; h->next=p;\n        p=h; h=n;\n    }\n    return p;\n}",
    [
      ["Reverse Linked List", "reverse-linked-list", "Easy"],
      ["Linked List Cycle", "linked-list-cycle", "Easy"],
    ],
  ),
  t(
    "stacks",
    "Stacks & queues",
    "Data structures",
    "Choose last-in-first-out or first-in-first-out to match the problem.",
    "A stack of canvases gives back the last one placed. A queue at an exhibition serves the first arrival.",
    [
      "Use a stack for nested work, undo, and matching brackets.",
      "Use a queue for level-order exploration and processing in arrival order.",
      "For brackets, a closing symbol must match the most recent unmatched opening symbol.",
    ],
    "A closing bracket cannot pop an empty stack. A nonempty stack at the end means unmatched openings.",
    "O(1) stack/queue end operations with suitable storage; bracket scan O(n).",
    'def valid(s):\n    stack = []\n    pairs = {\")\":\"(\", \"}\":\"{\", \"]\":\"[\"}\n    for c in s:\n        if c in pairs:\n            if not stack or stack.pop()!=pairs[c]: return False\n        else: stack.append(c)\n    return not stack',
    "/* Parentheses only; other characters ignored */\nint valid(char *s) {\n    int depth=0;\n    for (; *s; s++) {\n        if (*s=='(') depth++;\n        if (*s==')' && --depth<0) return 0;\n    }\n    return depth==0;\n}",
    [
      ["Valid Parentheses", "valid-parentheses", "Easy"],
      ["Daily Temperatures", "daily-temperatures", "Medium"],
    ],
  ),
  t(
    "recursion",
    "Recursion & backtracking",
    "Problem solving",
    "Solve a smaller version, then combine it or explore another choice.",
    "A branching sketch grows one branch at a time; backtracking erases a choice before trying another.",
    [
      "Write a base case that needs no recursive call.",
      "Ensure every call moves closer to that case.",
      "For backtracking: choose, explore, undo. Copy the path when saving a solution.",
    ],
    "Forgetting the undo step leaks state between branches. The recursive call stack uses memory.",
    "Factorial O(n) time and O(n) stack; generating subsets requires exponential output.",
    "def factorial(n):\n    if n <= 1: return 1\n    return n * factorial(n-1)",
    "long long factorial(int n) {\n    if (n<=1) return 1;\n    return n*factorial(n-1);\n}\n/* Small nonnegative n only; overflow matters. */",
    [
      ["Subsets", "subsets", "Medium"],
      ["Permutations", "permutations", "Medium"],
    ],
  ),
  t(
    "sorting",
    "Sorting & intervals",
    "Problem solving",
    "Create order to make comparisons and overlapping ranges easier.",
    "Hang the paintings in order of their start dates, then combine exhibitions that overlap.",
    [
      "Pick sorting based on input size, stability, and memory constraints.",
      "For intervals, sort by start, then compare each interval with the last merged interval.",
      "Extend the last end when intervals overlap; otherwise start a new result interval.",
    ],
    "For closed intervals, [1,3] and [3,5] overlap. Define endpoint rules before coding.",
    "Merge sort O(n log n) time and O(n) space; sorting plus merging intervals O(n log n).",
    "def merge(intervals):\n    out = []\n    for a,b in sorted(intervals):\n        if out and a <= out[-1][1]:\n            out[-1][1] = max(out[-1][1], b)\n        else: out.append([a,b])\n    return out",
    "void insertionSort(int a[], int n) {\n    for (int i=1; i<n; i++) {\n        int x=a[i], j=i-1;\n        while (j>=0 && a[j]>x) {\n            a[j+1]=a[j]; j--;\n        }\n        a[j+1]=x;\n    }\n}\n/* This example: O(n^2) worst-case time. */",
    [
      ["Merge Sorted Array", "merge-sorted-array", "Easy"],
      ["Merge Intervals", "merge-intervals", "Medium"],
    ],
  ),
  t(
    "trees",
    "Trees & BSTs",
    "Data structures",
    "Work recursively with hierarchical data and ordered search trees.",
    "A gallery map branches into wings and rooms. Every room is the root of its own smaller map.",
    [
      "Use preorder for root first, inorder for left-root-right, postorder for children first.",
      "A BST constrains every value in the left/right subtree, not only immediate children.",
      "For depth, ask both children for their depth and add one to the maximum.",
    ],
    "A skewed tree has height n, so BST search is not always O(log n).",
    "Full traversal O(n) time and O(h) call stack, where h is height.",
    "def depth(root):\n    if root is None: return 0\n    return 1 + max(depth(root.left), depth(root.right))",
    "struct Tree { int val; struct Tree *left, *right; };\nint depth(struct Tree *r) {\n    if (!r) return 0;\n    int a=depth(r->left), b=depth(r->right);\n    return 1+(a>b?a:b);\n}",
    [
      ["Maximum Depth of Binary Tree", "maximum-depth-of-binary-tree", "Easy"],
      ["Validate Binary Search Tree", "validate-binary-search-tree", "Medium"],
    ],
  ),
  t(
    "heaps",
    "Heaps & priority queues",
    "Data structures",
    "Keep the most important element available without sorting everything.",
    "A curator always picks the next highest-priority restoration, even as new work arrives.",
    [
      "A min-heap places its minimum at the root; it is not a fully sorted array.",
      "To keep the k largest values, keep a min-heap of size k.",
      "Push a value, remove the smallest if size exceeds k; the root is the kth largest.",
    ],
    "A heap guarantees parent-child order, not order between siblings.",
    "Peek O(1); insert/remove O(log n); top-k O(n log k).",
    "import heapq\ndef kth_largest(a, k):\n    heap = []\n    for x in a:\n        heapq.heappush(heap,x)\n        if len(heap)>k: heapq.heappop(heap)\n    return heap[0]",
    "void siftUp(int h[], int i) {\n    while (i>0) {\n        int p=(i-1)/2;\n        if (h[p]<=h[i]) break;\n        int t=h[p]; h[p]=h[i]; h[i]=t;\n        i=p;\n    }\n}",
    [
      ["Last Stone Weight", "last-stone-weight", "Easy"],
      [
        "Kth Largest Element in an Array",
        "kth-largest-element-in-an-array",
        "Medium",
      ],
    ],
  ),
  t(
    "graphs",
    "Graphs: BFS & DFS",
    "Connected problems",
    "Explore connected data while avoiding repeated visits.",
    "Rooms and corridors become vertices and edges. A visited set stops you walking in circles.",
    [
      "Represent sparse graphs with adjacency lists.",
      "Use BFS with a queue for shortest paths measured in edges in an unweighted graph.",
      "Mark nodes when discovered. Use DFS for exploring components and recursive structure.",
    ],
    "BFS does not solve arbitrary weighted shortest paths. A disconnected graph may need multiple starts.",
    "BFS/DFS O(V+E) time and O(V) auxiliary space with adjacency lists.",
    "from collections import deque\ndef distances(g, start):\n    dist, q = {start:0}, deque([start])\n    while q:\n        u = q.popleft()\n        for v in g[u]:\n            if v not in dist:\n                dist[v]=dist[u]+1\n                q.append(v)\n    return dist",
    "/* Adjacency matrix: O(V^2) traversal */\nvoid dfs(int n, int g[n][n], int u, int seen[]) {\n    seen[u]=1;\n    for (int v=0; v<n; v++)\n        if (g[u][v] && !seen[v])\n            dfs(n,g,v,seen);\n}",
    [
      ["Flood Fill", "flood-fill", "Easy"],
      ["Number of Islands", "number-of-islands", "Medium"],
    ],
  ),
  t(
    "greedy",
    "Greedy thinking",
    "Connected problems",
    "Make a locally best choice only when you can justify it globally.",
    "To visit the most exhibitions, choose the next one that finishes soonest, leaving room for more.",
    [
      "State the greedy rule exactly.",
      "Try to find a counterexample before trusting it.",
      "Use an exchange argument: show an optimal solution can take your choice without becoming worse.",
    ],
    "Taking the largest available coin does not minimize the number of coins for every denomination system.",
    "Interval scheduling: O(n log n) sorting, O(n) scan.",
    'def max_events(intervals):\n    end, count = float(\"-inf\"), 0\n    for a,b in sorted(intervals, key=lambda x:x[1]):\n        if a >= end:\n            count, end = count+1, b\n    return count',
    "/* Intervals already sorted by end */\nint select(int starts[], int ends[], int n) {\n    if (!n) return 0;\n    int end=ends[0], count=1;\n    for (int i=1; i<n; i++)\n        if (starts[i]>=end) { end=ends[i]; count++; }\n    return count;\n}",
    [
      ["Assign Cookies", "assign-cookies", "Easy"],
      ["Jump Game", "jump-game", "Medium"],
    ],
  ),
  t(
    "dp",
    "Dynamic programming",
    "Advanced canvas",
    "Store answers to overlapping subproblems instead of recomputing them.",
    "Save a colour mixture that you will need again. A table of small mixtures builds the final palette.",
    [
      "Define exactly what dp[i] means.",
      "Find a recurrence using smaller solved states and write the base cases.",
      "Choose a computation order, then reduce space if only recent states are needed.",
    ],
    "Memoization is not enough: an unclear state definition leads to an incorrect recurrence.",
    "Climbing stairs O(n) time, O(1) space with two rolling states.",
    "def stairs(n):\n    a, b = 1, 1\n    for _ in range(2,n+1):\n        a,b = b,a+b\n    return b",
    "int stairs(int n) {\n    int a=1, b=1;\n    for (int i=2; i<=n; i++) {\n        int c=a+b; a=b; b=c;\n    }\n    return b;\n}\n/* Small n only; count may overflow int. */",
    [
      ["Climbing Stairs", "climbing-stairs", "Easy"],
      ["House Robber", "house-robber", "Medium"],
    ],
  ),
  t(
    "advanced",
    "Tries & bit manipulation",
    "Advanced canvas",
    "Use prefixes and binary representation to reveal structure.",
    "A trie shares the beginning of many labels. Bits act like tiny on/off switches in a palette.",
    [
      "A trie edge stores one character; mark ends to distinguish words from prefixes.",
      "XOR has x^x=0 and x^0=x, so paired duplicates cancel.",
      "Before using a bit trick, state its assumptions and integer representation.",
    ],
    "XOR finds a single value only under the right repetition assumptions. A trie prefix is not necessarily a complete word.",
    "Trie lookup O(L) for word length L; XOR single-value scan O(n) time, O(1) space.",
    "def single(a):\n    result = 0\n    for x in a: result ^= x\n    return result",
    "int single(int a[], int n) {\n    int x=0;\n    for (int i=0; i<n; i++) x^=a[i];\n    return x;\n}",
    [
      ["Single Number", "single-number", "Easy"],
      ["Implement Trie (Prefix Tree)", "implement-trie-prefix-tree", "Medium"],
    ],
  ),
];
export type Question = {
  prompt: string;
  options: string[];
  answer: string;
  explanation: string;
  hint: string;
  display?: number[];
};
export function questionFor(
  id: string,
  seed: number,
  challenge = false,
): Question {
  const x = 2 + (seed % 5),
    y = x + 3,
    v = seed % 3;
  const q = (
    prompt: string,
    answer: string | number,
    wrong: (string | number)[],
    explanation: string,
    hint: string,
    display?: number[],
  ): Question => {
    const a = String(answer);
    const all = [a, ...wrong.map(String)].filter(
      (n, i, arr) => arr.indexOf(n) === i,
    );
    const shift = seed % all.length;
    return {
      prompt,
      answer: a,
      options: [...all.slice(shift), ...all.slice(0, shift)],
      explanation,
      hint,
      display,
    };
  };
  switch (id) {
    case "complexity":
      return v === 0
        ? q(
            `An outer loop runs n times. Inside it, another loop runs n times. What is the tight time complexity?`,
            "O(n²)",
            ["O(n)", "O(log n)", "O(1)"],
            "The inner body runs n times for each of n outer iterations: n × n.",
            "Multiply the iteration counts of independent nested loops.",
          )
        : v === 1
          ? q(
              `Starting at i = 1, a loop doubles i while i < n. What is its tight time complexity?`,
              "O(log n)",
              ["O(n)", "O(n²)", "O(1)"],
              "After k iterations, i = 2^k. Reaching n requires about log₂(n) iterations.",
              "Write the sequence 1, 2, 4, 8…",
            )
          : q(
              `One loop scans n items, followed by another scanning ${x}n items. What is the tight total time complexity?`,
              "O(n)",
              ["O(n²)", "O(log n)", "O(1)"],
              `n + ${x}n = ${x + 1}n. The constant multiplier is dropped.`,
              "Sequential loops add their work; they do not multiply.",
            );
    case "arrays":
      return v === 0
        ? q(
            `In [${x}, ${y}, ${x + 1}, ${y + 2}], what value is at index 2?`,
            x + 1,
            [x, y, y + 2],
            "Indices begin at 0. The third element has index 2.",
            "Label the positions 0, 1, 2, 3.",
            [x, y, x + 1, y + 2],
          )
        : v === 1
          ? q(
              `What is the sum of [${x}, ${y}, ${x + 2}]?`,
              2 * x + y + 2,
              [2 * x + y, x + y + 2, 2 * x + y + 3],
              "Start a running total at zero and add each item exactly once.",
              "Keep a running total after each item.",
              [x, y, x + 2],
            )
          : q(
              `What is the last valid index in an array of ${y} elements?`,
              y - 1,
              [y, y + 1, 0],
              "Zero-based indices run from 0 through n−1.",
              "The first index is 0.",
            );
    case "hashing":
      return v === 0
        ? q(
            `The target is ${x + y}. You are looking at ${x}. Which value should you look for in the map?`,
            y,
            [x + y, x, y + 1],
            `Complement = target − current = ${x + y} − ${x} = ${y}.`,
            "What number added to current makes the target?",
          )
        : v === 1
          ? q(
              `In [${x}, ${y}, ${x}, ${x}], what is the frequency of ${x}?`,
              3,
              [1, 2, 4],
              "Increment the count for that value each time it appears.",
              "Count matching occurrences, not distinct values.",
              [x, y, x, x],
            )
          : q(
              "For Two Sum, when should you add the current value to the map?",
              "After checking its complement",
              ["Before checking its complement", "Only after sorting", "Never"],
              "Checking first ensures the stored complement belongs to an earlier, different index.",
              "Can one element be used twice?",
            );
    case "pointers":
      return v === 0
        ? q(
            `In a sorted array, the sum at left and right is too small. What should you move?`,
            "Move left rightward",
            ["Move right leftward", "Move both outward", "Return no solution"],
            "Increasing the left index can increase the sum; decreasing right would make it no larger.",
            "You need a larger sum.",
          )
        : v === 1
          ? q(
              `Sorted array [${x}, ${y}, ${y + 2}, ${y + 4}], target ${x + y + 4}. What is the sum of the first and last values?`,
              x + y + 4,
              [x + y, x + y + 2, 2 * y + 4],
              "Read both boundary values, then add them.",
              "The last value is y + 4.",
              [x, y, y + 2, y + 4],
            )
          : q(
              "Two pointers are checking a sorted pair sum that is too large. What is the next move?",
              "Move right leftward",
              ["Move left rightward", "Sort again", "Reset both pointers"],
              "The right value is the larger boundary. Moving it left can decrease the sum.",
              "Which movement can decrease the sum?",
            );
    case "window": {
      const a = [x, 2, y, 1, x + 1];
      const sums = [x + 2 + y, 2 + y + 1, y + 1 + x + 1];
      const best = Math.max(...sums);
      return v === 0
        ? q(
            `What is the largest sum of any 3 consecutive values in [${a.join(", ")}]?`,
            best,
            [best - 1, best + 1, a.reduce((s, n) => s + n, 0)],
            `The 3 window sums are ${sums.join(", ")}. Their maximum is ${best}.`,
            "Slide a frame of length 3 one position at a time.",
            a,
          )
        : v === 1
          ? q(
              `A window sum is ${x + y}. The outgoing value is ${x} and incoming value is ${y}. What is the new sum?`,
              2 * y,
              [x + 2 * y, x + y, 2 * y + 1],
              `New sum = ${x + y} − ${x} + ${y} = ${2 * y}.`,
              "Subtract what leaves, add what enters.",
            )
          : q(
              "A fixed-size window of length k moves one step. How many items leave and enter?",
              "One leaves, one enters",
              [
                "All k leave and enter",
                "Only one enters",
                "Two leave, none enter",
              ],
              "Adjacent length-k windows overlap in k−1 positions.",
              "Draw two overlapping frames of equal length.",
            );
    }
    case "search":
      return v === 0
        ? q(
            `Inclusive bounds are left = 0 and right = ${2 * y}. What is floor((left + right) / 2)?`,
            y,
            [y - 1, y + 1, 2 * y],
            `The midpoint is floor(${2 * y}/2) = ${y}.`,
            "Use integer division.",
          )
        : v === 1
          ? q(
              "The middle value is smaller than the target in an ascending array. How do you update inclusive bounds?",
              "left = mid + 1",
              ["right = mid − 1", "left = mid", "right = mid + 1"],
              "The middle and everything to its left cannot be the target.",
              "Discard the half containing values that are too small.",
            )
          : q(
              "Which condition keeps an inclusive-bound binary search running?",
              "left <= right",
              ["left < right", "left == right", "left > right"],
              "When left equals right, one candidate remains and still needs checking.",
              "Do not skip the final single candidate.",
            );
    case "linked":
      return v === 0
        ? q(
            `After reversing ${x} → ${y} → ${y + 2}, what is the new head value?`,
            y + 2,
            [x, y, 0],
            "The original last node becomes the head.",
            "Read the original list backwards.",
            [x, y, y + 2],
          )
        : v === 1
          ? q(
              "Before changing current.next during reversal, what must you save?",
              "The original next node",
              [
                "Only the current value",
                "The list length",
                "The previous value",
              ],
              "Once the link changes, you need the saved next node to continue traversal.",
              "Do not lose access to the remaining list.",
            )
          : q(
              "After reversing an entire linked list iteratively, which pointer is returned as the new head?",
              "previous",
              ["current (now null)", "original head", "saved length"],
              "Previous points to the final processed node; current has reached null.",
              "Trace a one-node list first.",
            );
    case "stacks":
      return v === 0
        ? q(
            `Push ${x}, then ${y}, then ${y + 2} onto a stack. What does one pop return?`,
            y + 2,
            [x, y, 0],
            "A stack removes the last value added: last-in-first-out.",
            "Picture a stack of canvases.",
            [x, y, y + 2],
          )
        : v === 1
          ? q(
              `Enqueue ${x}, then ${y}, then ${y + 2}. What does one dequeue return?`,
              x,
              [y, y + 2, 0],
              "A queue removes the earliest value added: first-in-first-out.",
              "Picture people waiting in a line.",
              [x, y, y + 2],
            )
          : q(
              "Is the bracket string ([)] correctly nested?",
              "No",
              ["Yes"],
              "The closing ) would need ( at the top, but [ is currently on top.",
              "Always match the most recent unmatched opening bracket.",
            );
    case "recursion": {
      const n = 3 + (seed % 3);
      const f = (k: number): number => (k <= 1 ? 1 : k * f(k - 1));
      return v === 0
        ? q(
            `What is factorial(${n})?`,
            f(n),
            [n * n, f(n) - 1, f(n) + n],
            `${n}! is the product of integers from 1 through ${n}. The base case is 0! = 1.`,
            "Multiply down to the base case.",
          )
        : v === 1
          ? q(
              `How many subsets does a set of ${n} distinct elements have, including the empty set?`,
              2 ** n,
              [n * n, n, 2 ** n - 1],
              "Each element has two independent choices: include or exclude.",
              "Multiply 2 once for each element.",
            )
          : q(
              "After exploring one backtracking branch, what happens before exploring the next?",
              "Undo the last choice",
              [
                "Keep all previous changes",
                "Delete the base case",
                "Restart the program",
              ],
              "Restoring state makes sibling branches independent.",
              "Choose, explore, then…",
            );
    }
    case "sorting":
      return v === 0
        ? q(
            `Merge closed intervals [1, ${y}] and [${x}, ${y + 3}]. What is the result?`,
            `[1, ${y + 3}]`,
            [`[1, ${y}]`, `[${x}, ${y + 3}]`, `[1, ${x}]`],
            "The intervals overlap. Keep the smaller start and larger end.",
            "Check whether the second start is at most the first end.",
          )
        : v === 1
          ? q(
              "What is merge sort’s worst-case time complexity?",
              "O(n log n)",
              ["O(n)", "O(n²)", "O(log n)"],
              "There are logarithmically many split levels, with linear merging work per level.",
              "Work per level × number of levels.",
            )
          : q(
              "Before a one-pass merge of overlapping intervals, sort by what?",
              "Start position",
              ["Length only", "End position descending", "Original position"],
              "Sorting by start lets each new interval be compared with the last merged interval.",
              "Which order makes future intervals start no earlier than the current one?",
            );
    case "trees":
      return v === 0
        ? q(
            `A tree root has child subtree depths ${x} and ${y}. What is its depth, counting nodes?`,
            y + 1,
            [y, x + y, x + 1],
            `Depth = 1 + max(${x}, ${y}) = ${y + 1}.`,
            "Include the root itself.",
          )
        : v === 1
          ? q(
              "Which traversal of a valid BST with distinct keys returns ascending order?",
              "Inorder",
              ["Preorder", "Postorder", "Level order"],
              "Inorder visits left subtree, root, right subtree, following the BST ordering.",
              "Smaller values must be visited before the root.",
            )
          : q(
              "What is the worst-case height of a BST with n nodes?",
              "n",
              ["log₂(n) always", "1 always", "n²"],
              "Inserting already sorted keys into an unbalanced BST can create a chain.",
              "Imagine every node has only one child.",
            );
    case "heaps":
      return v === 0
        ? q(
            `What is at the root of a min-heap containing ${x}, ${y}, ${x + 2}?`,
            x,
            [y, x + 2, 0],
            "A min-heap keeps its minimum value at the root.",
            "Min means minimum.",
            [x, y, x + 2],
          )
        : v === 1
          ? q(
              `Which heap maintains the ${x} largest values while discarding smaller values?`,
              `Min-heap of size ${x}`,
              [`Max-heap of size ${x}`, "A stack", "An empty heap"],
              "The smallest retained candidate sits at the root and is the first to be discarded.",
              "Which of your retained values should leave next?",
            )
          : q(
              "Are the values in a heap array necessarily fully sorted?",
              "No",
              ["Yes"],
              "Heap order only constrains each parent relative to its children, not every pair of positions.",
              "Think about siblings.",
            );
    case "graphs":
      return v === 0
        ? q(
            `An unweighted chain is A–B–C–D. How many edges are on the shortest path from A to D?`,
            3,
            [2, 4, 1],
            "The path uses A–B, B–C, and C–D: three edges.",
            "Count corridors, not rooms.",
          )
        : v === 1
          ? q(
              "Which structure is used by breadth-first search?",
              "Queue",
              ["Stack", "Min-heap always", "Sorted array always"],
              "A queue processes the oldest frontier first, preserving level order.",
              "Visit every node at the current distance before moving farther.",
            )
          : q(
              "With adjacency lists, what is the time complexity of a full BFS traversal?",
              "O(V + E)",
              ["O(V × E)", "O(log V)", "O(E²)"],
              "Each vertex is discovered once and every adjacency entry is examined once.",
              "Count both vertices and edges.",
            );
    case "greedy":
      return v === 0
        ? q(
            "Which interval should you choose first to maximize the number of non-overlapping intervals?",
            "The earliest finishing interval",
            [
              "The longest interval",
              "The latest starting interval",
              "The earliest starting interval always",
            ],
            "Finishing earliest leaves the maximum remaining time for subsequent intervals.",
            "Leave the most room for future choices.",
          )
        : v === 1
          ? q(
              "With coins 1, 3, 4, what is the minimum number of coins for a total of 6?",
              2,
              [3, 4, 6],
              "3 + 3 uses 2 coins; greedy 4 + 1 + 1 uses 3. This is a counterexample to largest-coin-first.",
              "Try two coins of value 3.",
            )
          : q(
              "What makes a greedy strategy trustworthy?",
              "A proof that local choices preserve an optimum",
              [
                "Passing one example",
                "Always choosing the largest item",
                "Using no extra memory",
              ],
              "A greedy rule needs a correctness argument, such as an exchange argument.",
              "Look for counterexamples, then justify the rule.",
            );
    case "dp": {
      const n = 3 + (seed % 5);
      const fib = (k: number): number => (k <= 1 ? 1 : fib(k - 1) + fib(k - 2));
      return v === 0
        ? q(
            `You can climb 1 or 2 steps at a time. How many distinct ways reach step ${n}?`,
            fib(n),
            [n, fib(n) + 1, fib(n) - 1],
            `ways(n) = ways(n−1) + ways(n−2), with ways(0)=ways(1)=1. For ${n} steps, this gives ${fib(n)}.`,
            "The final move came from either n−1 or n−2.",
          )
        : v === 1
          ? q(
              "A recurrence only needs the previous two states. How much extra storage is needed?",
              "O(1)",
              ["O(n) always", "O(n²)", "O(log n)"],
              "Keep two rolling values and overwrite states that will never be used again.",
              "How many old values must remain available?",
            )
          : q(
              "What should you define before writing a DP recurrence?",
              "The precise meaning of each state",
              [
                "The output colour",
                "A random base case",
                "The recursion depth only",
              ],
              "The state meaning determines which smaller states can be combined correctly.",
              "Complete the sentence: dp[i] means…",
            );
    }
    default:
      return v === 0
        ? q(
            `Every value is paired except one: [${x}, ${y}, ${x}]. What is the single value?`,
            y,
            [x, 0, x + y],
            "XOR cancels paired equal values, leaving the unpaired value.",
            "x XOR x is zero.",
            [x, y, x],
          )
        : v === 1
          ? q(
              "A trie contains the word paint. Does this alone mean pain is stored as a complete word?",
              "No",
              ["Yes"],
              "A prefix exists as a path, but complete words require an end-of-word marker.",
              "A prefix and a complete word are different.",
            )
          : q(
              `What is ${x} XOR ${x}?`,
              0,
              [x, 2 * x, 1],
              "Each equal pair of bits cancels under XOR.",
              "Equal bits XOR to zero.",
            );
  }
}
export type Attempt = {
  id: string;
  topic: string;
  kind: "drill" | "diagnostic" | "external";
  seed: number;
  correct: number;
  hint: number;
  seconds: number;
  created_at: string;
  label: string;
  reflection: string;
  outcome: string;
};
export type Settings = {
  minutes: number;
  language: "Python" | "C" | "Java";
  pace: "gentle" | "balanced" | "intensive";
  focus: string;
  goal: string;
};
export const defaults: Settings = {
  minutes: 30,
  language: "C",
  pace: "balanced",
  focus: "auto",
  goal: "Build strong foundations",
};
export type Studio = {
  settings: Settings;
  attempts: Attempt[];
  lessons: string[];
  drafts?: Record<string, string>;
  bookmarks?: string[];
  sessions?: { id: string; minutes: number; at: string }[];
};
export function topicStats(attempts: Attempt[], id: string) {
  const a = attempts
    .filter((a) => a.topic === id && a.kind !== "external")
    .slice(0, 6);
  const weighted = a.reduce(
    (s, t, i) => s + (t.correct ? (t.hint ? 0.65 : 1) : 0) * (6 - i),
    0,
  );
  const weight = a.reduce((s, _, i) => s + 6 - i, 0);
  return {
    n: a.length,
    score: weight
      ? Math.round(((100 * weighted) / weight) * Math.min(a.length / 3, 1))
      : 0,
    accuracy: a.length
      ? Math.round((a.filter((t) => t.correct).length / a.length) * 100)
      : 0,
    last: a[0],
  };
}
export function recommendation(s: Studio) {
  const now = Date.now();
  const due = topics.find((t) => {
    const x = topicStats(s.attempts, t.id);
    return (
      x.last &&
      x.score >= 70 &&
      now - new Date(x.last.created_at).getTime() >
        (x.score >= 90 ? 7 : 3) * 86400000
    );
  });
  if (due)
    return {
      topic: due,
      reason:
        "A spaced review is due. Retrieve this idea from memory to help it stick.",
      mode: "Review",
    };
  if (s.settings.focus !== "auto") {
    const focus = topics.find((t) => t.id === s.settings.focus);
    if (focus)
      return {
        topic: focus,
        reason:
          "You chose this focus in your workflow. We’ll keep practising it until you change your focus.",
        mode: "Your focus",
      };
  }
  const target =
    s.settings.pace === "gentle"
      ? 85
      : s.settings.pace === "intensive"
        ? 65
        : 70;
  const next =
    topics.find((t) => topicStats(s.attempts, t.id).score < target) ||
    topics.reduce((a, b) =>
      topicStats(s.attempts, a.id).score < topicStats(s.attempts, b.id).score
        ? a
        : b,
    );
  const stat = topicStats(s.attempts, next.id);
  return {
    topic: next,
    reason:
      stat.last && !stat.last.correct
        ? "Your last check found a gap here. A worked example and a fresh drill will help."
        : stat.n
          ? `Your mastery estimate is ${stat.score}%. Practise toward ${target}% before moving ahead.`
          : "A strong next step in your sequence. Start with the idea, then put it into practice.",
    mode: stat.n ? "Keep practising" : "Start learning",
  };
}
