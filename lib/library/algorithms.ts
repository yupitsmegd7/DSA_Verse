export type Value = number | boolean | string | Value[];
export type Input = { values: number[]; k: number };
export type Algorithm = {
  id: string;
  title: string;
  topic: string;
  lesson: string;
  contract: string;
  idea: string;
  invariant: string;
  complexity: string;
  pitfall: string;
  solve: (input: Input) => Value;
};
const sum = (a: number[]) => a.reduce((s, x) => s + x, 0);
const sorted = (a: number[]) => [...a].sort((a, b) => a - b);
const words = (a: number[]) =>
  a.map(
    (x) =>
      ["ink", "iris", "ivy", "oak", "ochre", "olive", "rose", "reed", "ruby"][
        Math.abs(x) % 9
      ],
  );
// A deterministic directed studio network: i -> i+1, plus i -> i+2 when |a[i]| is even.
export function edges(a: number[]): [number, number, number][] {
  return a.flatMap((x, i) => [
    ...(i + 1 < a.length
      ? [[i, i + 1, (Math.abs(x) % 9) + 1] as [number, number, number]]
      : []),
    ...(i + 2 < a.length && Math.abs(x) % 2 === 0
      ? [[i, i + 2, (Math.abs(x) % 5) + 1] as [number, number, number]]
      : []),
  ]);
}
const graphContract =
  "Create vertices 0..n−1. For each i<n−1, add i→i+1 with weight |values[i]|%9+1. Also add i→i+2 with weight |values[i]|%5+1 when i+2<n and |values[i]| is even. The empty graph returns 0.";
function bfs(a: number[]) {
  if (!a.length) return 0;
  const d = Array(a.length).fill(-1);
  d[0] = 0;
  const queue = [0];
  for (let h = 0; h < queue.length; h++)
    for (const [u, v] of edges(a))
      if (u === queue[h] && d[v] === -1) {
        d[v] = d[u] + 1;
        queue.push(v);
      }
  return d.at(-1)!;
}
function shortest(a: number[]) {
  if (!a.length) return 0;
  const d = Array(a.length).fill(Infinity);
  d[0] = 0;
  for (let u = 0; u < a.length; u++)
    for (const [s, v, w] of edges(a))
      if (s === u) d[v] = Math.min(d[v], d[u] + w);
  return d.at(-1)!;
}
function lis(a: number[]) {
  const d = a.map(() => 1);
  for (let i = 0; i < a.length; i++)
    for (let j = 0; j < i; j++)
      if (a[j] < a[i]) d[i] = Math.max(d[i], d[j] + 1);
  return Math.max(0, ...d);
}
function treeFold(a: number[], i: number, depth = 0): number[] {
  if (i >= a.length) return [];
  return [
    ...treeFold(a, 2 * i + 1, depth + 1),
    a[i],
    ...treeFold(a, 2 * i + 2, depth + 1),
  ];
}
function components(a: number[], k: number) {
  const p = a.map((_, i) => i);
  const find = (x: number): number => (p[x] === x ? x : (p[x] = find(p[x])));
  for (let i = 0; i < a.length; i++)
    for (let j = i + 1; j < a.length; j++)
      if (Math.abs(a[i] - a[j]) <= k) p[find(i)] = find(j);
  return new Set(p.map((_, i) => find(i))).size;
}
function intervalMerge(a: number[], k: number) {
  const intervals = sorted(a).map((x) => [x, x + k]);
  const result: number[][] = [];
  for (const pair of intervals) {
    const last = result.at(-1);
    if (last && pair[0] <= last[1]) last[1] = Math.max(last[1], pair[1]);
    else result.push(pair);
  }
  return result;
}
function add(
  id: string,
  title: string,
  topic: string,
  lesson: string,
  contract: string,
  idea: string,
  invariant: string,
  complexity: string,
  pitfall: string,
  solve: Algorithm["solve"],
): Algorithm {
  return {
    id,
    title,
    topic,
    lesson,
    contract,
    idea,
    invariant,
    complexity,
    pitfall,
    solve,
  };
}
export const algorithms: Algorithm[] = [
  add(
    "canvas-total",
    "Canvas pigment budget",
    "Arrays",
    "arrays",
    "Return the sum of values. An empty tray costs 0.",
    "Accumulate one pigment cost at a time.",
    "total equals the sum of all elements before the cursor.",
    "O(n) time · O(1) extra space",
    "Initialize the total to zero, not the first element: the tray can be empty.",
    ({ values: a }) => sum(a),
  ),
  add(
    "balanced-cut",
    "Balanced gallery wall",
    "Arrays",
    "arrays",
    "Return the smallest zero-based index whose strict left and right sums are equal; return -1 if none exists.",
    "Keep a running left sum and subtract from the full sum for the right side.",
    "left excludes the current element, as does right.",
    "O(n) time · O(1) extra space",
    "The current value belongs to neither side.",
    ({ values: a }) => {
      let left = 0,
        total = sum(a);
      for (let i = 0; i < a.length; i++) {
        if (left === total - left - a[i]) return i;
        left += a[i];
      }
      return -1;
    },
  ),
  add(
    "label-runs",
    "Label press runs",
    "Strings",
    "arrays",
    "Map each integer x to a letter: a for |x|%4=0, b for 1, c for 2, d for 3. Return the number of maximal runs of equal adjacent letters; empty input returns 0.",
    "A run starts at index zero or when the letter changes.",
    "The count includes exactly one entry for each run already visited.",
    "O(n) time · O(1) extra space",
    "Equal letters in separate positions are separate runs if another letter divides them.",
    ({ values: a }) =>
      a.filter((x, i) => i === 0 || Math.abs(x) % 4 !== Math.abs(a[i - 1]) % 4)
        .length,
  ),
  add(
    "mirror-label",
    "Mirror label repairs",
    "Strings",
    "pointers",
    "Map x to a letter using |x|%4 (a,b,c,d). Return the minimum substitutions needed to make that label a palindrome.",
    "Compare opposite ends. Each mismatched pair needs one substitution.",
    "Every inspected mirrored pair is accounted for once.",
    "O(n) time · O(1) extra space",
    "Do not count a mismatch twice or charge for the middle letter.",
    ({ values: a }) => {
      let r = 0;
      for (let i = 0; i < Math.floor(a.length / 2); i++)
        r += +(Math.abs(a[i]) % 4 !== Math.abs(a[a.length - 1 - i]) % 4);
      return r;
    },
  ),
  add(
    "repeat-pigment",
    "Repeated pigment ledger",
    "Hash maps",
    "hashing",
    "Return the distinct values occurring at least twice, in ascending order.",
    "Build frequencies, then sort the repeated keys.",
    "The map stores the frequency of every processed value.",
    "O(n + u log u) time · O(u) space, u distinct values",
    "Return each repeated value once, even if it occurs many times.",
    ({ values: a }) => {
      const m = new Map<number, number>();
      a.forEach((x) => m.set(x, (m.get(x) || 0) + 1));
      return sorted([...m.keys()].filter((x) => m.get(x)! > 1));
    },
  ),
  add(
    "first-single",
    "One-off paint stamp",
    "Hash maps",
    "hashing",
    "Return the index of the first value occurring exactly once; return -1 if none exists.",
    "Count all frequencies first; then scan the original order.",
    "A frequency is final only after the complete counting pass.",
    "O(n) time · O(u) space",
    "Return the index, not the unique value.",
    ({ values: a }) => {
      const m = new Map<number, number>();
      a.forEach((x) => m.set(x, (m.get(x) || 0) + 1));
      return a.findIndex((x) => m.get(x) === 1);
    },
  ),
  add(
    "near-pairs",
    "Neighboring pigment pairs",
    "Two pointers",
    "pointers",
    "Sort the values. Return the number of index pairs i<j whose absolute difference is at most k; duplicates count by position.",
    "Move a left boundary so the current window has width at most k; add its preceding elements.",
    "All positions from left through right differ from the right value by at most k.",
    "O(n log n) time including sorting · O(n) copied storage",
    "Count all valid earlier positions, not just an adjacent neighbor.",
    ({ values: a, k }) => {
      const b = sorted(a);
      let l = 0,
        r = 0;
      for (let i = 0; i < b.length; i++) {
        while (b[i] - b[l] > k) l++;
        r += i - l;
      }
      return r;
    },
  ),
  add(
    "square-order",
    "Squared canvas measurements",
    "Two pointers",
    "pointers",
    "Return the squares of all values in nondecreasing order.",
    "Sort first, then compare the absolute values at opposite ends and fill the result from the back.",
    "The largest remaining square is at one of the two ends of the sorted input.",
    "O(n log n) time including sorting · O(n) space",
    "Negative values may produce the largest squares.",
    ({ values: a }) => sorted(a.map((x) => x * x)),
  ),
  add(
    "window-budget",
    "Moving frame budget",
    "Sliding windows",
    "window",
    "Return the largest sum of a contiguous block of exactly k elements; return 0 when n<k.",
    "Build the first k-element sum; slide by adding the incoming and subtracting the outgoing value.",
    "The rolling sum always contains exactly k values.",
    "O(n) time · O(1) extra space",
    "For all-negative windows, initialize from the first actual window rather than zero.",
    ({ values: a, k }) => {
      if (a.length < k) return 0;
      let s = sum(a.slice(0, k)),
        best = s;
      for (let i = k; i < a.length; i++) {
        s += a[i] - a[i - k];
        best = Math.max(best, s);
      }
      return best;
    },
  ),
  add(
    "distinct-frame",
    "Distinct colors in each frame",
    "Sliding windows",
    "window",
    "Return an array containing the number of distinct values in every consecutive k-element window, from left to right. Return [] if n<k.",
    "Maintain a frequency map as values enter and leave the window.",
    "Only positive-frequency keys represent colors currently inside the frame.",
    "O(n) expected time · O(k) extra space",
    "Delete a color from the map when its count falls to zero.",
    ({ values: a, k }) =>
      Array.from(
        { length: Math.max(0, a.length - k + 1) },
        (_, i) => new Set(a.slice(i, i + k)).size,
      ),
  ),
  add(
    "shelf-insertion",
    "Archive insertion slot",
    "Binary search",
    "search",
    "Sort values and return the first index with value >=k, or n if there is no such index.",
    "Use a half-open search interval [lo, hi), discarding the half that cannot contain the first valid position.",
    "Every index before lo is too small; every index at or after hi is a valid upper candidate.",
    "O(n log n) sorting + O(log n) search · O(n) copied storage",
    "The answer may be n, a position after the last item.",
    ({ values: a, k }) => {
      const b = sorted(a);
      let l = 0,
        h = b.length;
      while (l < h) {
        let m = (l + h) >> 1;
        if (b[m] < k) l = m + 1;
        else h = m;
      }
      return l;
    },
  ),
  add(
    "capacity-search",
    "Kiln capacity search",
    "Binary search",
    "search",
    "Each item has weight |values[i]|+1. In input order, partition items into at most k nonempty consecutive batches. Return the minimum possible largest batch weight; empty input returns 0.",
    "Binary-search the capacity. A greedy scan computes how many batches a capacity requires.",
    "Feasibility is monotone: any capacity above a feasible one is also feasible.",
    "O(n log S) time · O(1) extra space, S total weight",
    "Never choose a capacity below the heaviest item.",
    ({ values: a, k }) => {
      if (!a.length) return 0;
      const w = a.map((x) => Math.abs(x) + 1);
      let l = Math.max(...w),
        h = sum(w);
      while (l < h) {
        let m = (l + h) >> 1,
          b = 1,
          s = 0;
        for (const x of w) {
          if (s + x > m) {
            b++;
            s = 0;
          }
          s += x;
        }
        if (b <= k) h = m;
        else l = m + 1;
      }
      return l;
    },
  ),
  add(
    "chain-hop",
    "Gallery chain hops",
    "Linked lists",
    "linked",
    "Treat values as a singly linked list in the given order. Return the values at indices 0,k,2k,... . Empty input returns [].",
    "Advance one next pointer at a time and emit every kth visited node.",
    "The traversal never skips counting an actual link.",
    "O(n) time · O(1) auxiliary space excluding output",
    "Linked lists do not support constant-time indexing.",
    ({ values: a, k }) => a.filter((_, i) => i % k === 0),
  ),
  add(
    "chain-weave",
    "Paired frame chain",
    "Linked lists",
    "linked",
    "Swap each adjacent pair of nodes and return their values in the new order. Preserve a final unpaired node.",
    "Use a dummy head, then reconnect previous→second→first→after.",
    "The processed prefix is connected to the unprocessed suffix.",
    "O(n) time · O(1) auxiliary space for pointer rewiring",
    "Save the next pair before changing the links.",
    ({ values: a }) => {
      const b = [...a];
      for (let i = 0; i + 1 < b.length; i += 2)
        [b[i], b[i + 1]] = [b[i + 1], b[i]];
      return b;
    },
  ),
  add(
    "undo-stack",
    "Restoration undo stack",
    "Stacks",
    "stacks",
    "Read values as commands: positive or zero pushes that value; a negative value pops once if the stack is nonempty. Return the final stack from bottom to top.",
    "Process commands using last-in-first-out order.",
    "The top is the most recent unmatched push.",
    "O(n) time · O(n) space",
    "A negative command means one pop, regardless of its magnitude.",
    ({ values: a }) => {
      const s: number[] = [];
      a.forEach((x) => (x >= 0 ? s.push(x) : s.pop()));
      return s;
    },
  ),
  add(
    "next-taller",
    "Next taller easel",
    "Stacks",
    "stacks",
    "For each position, return the distance to the first strictly greater value to its right; use 0 if none exists.",
    "Keep unresolved indices in a decreasing stack; a taller easel resolves smaller tops.",
    "Each index enters and leaves the stack at most once.",
    "O(n) time · O(n) space",
    "An equal height does not resolve a strictly-greater query.",
    ({ values: a }) => {
      const r = a.map(() => 0),
        s: number[] = [];
      a.forEach((x, i) => {
        while (s.length && a[s.at(-1)!] < x) {
          const j = s.pop()!;
          r[j] = i - j;
        }
        s.push(i);
      });
      return r;
    },
  ),
  add(
    "queue-rotation",
    "Ticket desk rotation",
    "Queues",
    "stacks",
    "Rotate a queue left k times and return its order. Each rotation moves the front to the back; an empty queue stays empty.",
    "Reduce k modulo n before applying the rotation.",
    "Relative order is preserved on both sides of the cut.",
    "O(n) time for output · O(n) output space",
    "Guard against taking modulo zero.",
    ({ values: a, k }) =>
      a.length ? [...a.slice(k % a.length), ...a.slice(0, k % a.length)] : [],
  ),
  add(
    "queue-service",
    "Gallery service rounds",
    "Queues",
    "stacks",
    "Each visitor i needs |values[i]|%4+1 service units. The front visitor consumes one unit then rejoins the back if unfinished. Return the original indices in completion order.",
    "Store both identity and remaining units in a queue.",
    "Every visitor in the queue has at least one unit remaining.",
    "O(n) time because each demand is at most 4 · O(n) space",
    "Do not lose a visitor's original index after rotations.",
    ({ values: a }) => {
      const q = a.map((x, i) => ({ i, t: (Math.abs(x) % 4) + 1 })),
        r: number[] = [];
      for (let h = 0; h < q.length; h++) {
        const v = q[h];
        v.t--;
        if (v.t) q.push(v);
        else r.push(v.i);
      }
      return r;
    },
  ),
  add(
    "recursive-depth",
    "Nested canvas depth",
    "Recursion",
    "recursion",
    "A function split(n) returns 0 for n=0, otherwise 1+split(floor(n/2)). Return split(values.length).",
    "Follow the decreasing argument until the base case, then accumulate returns.",
    "Each recursive argument is strictly smaller than its positive parent.",
    "O(log(n+1)) time and stack space",
    "The base case contributes zero, not one.",
    ({ values: a }) => {
      const f = (n: number): number => (n === 0 ? 0 : 1 + f(Math.floor(n / 2)));
      return f(a.length);
    },
  ),
  add(
    "recursive-fold",
    "Nested pigment fold",
    "Recursion",
    "recursion",
    "Define fold([])=0 and fold([x,...rest])=x-fold(rest). Return fold(values).",
    "Expand the calls before applying the subtraction on the way back.",
    "Every call returns the alternating sum starting at its own head.",
    "O(n) time · O(n) call stack",
    "Subtraction is not associative: x-(y-z) differs from (x-y)-z.",
    ({ values: a }) => a.reduceRight((s, x) => x - s, 0),
  ),
  add(
    "subset-ledger",
    "Exhibition subset ledger",
    "Backtracking",
    "recursion",
    "Count subsets of input positions whose values sum to k. Each position may be chosen once; duplicate values at different positions remain distinct choices.",
    "Branch on excluding or including each position; test the sum only at a complete decision path.",
    "The current sum equals the values chosen on the path from the root.",
    "O(2^n) time · O(n) recursive space",
    "Negative values make a simple currentSum>k pruning rule invalid.",
    ({ values: a, k }) => {
      const f = (i: number, s: number): number =>
        i === a.length ? +(s === k) : f(i + 1, s) + f(i + 1, s + a[i]);
      return f(0, 0);
    },
  ),
  add(
    "nonadjacent-choices",
    "Quiet wall selections",
    "Backtracking",
    "recursion",
    "Count subsets of exactly k input positions with no two adjacent positions. Values do not affect eligibility.",
    "At a position, either skip it or choose it and jump over its neighbor.",
    "Every chosen position is separated from the next chosen one by at least one gap.",
    "O(2^n) time · O(n) stack for plain backtracking",
    "The empty selection is valid when zero more choices are required.",
    ({ values: a, k }) => {
      const f = (i: number, left: number): number =>
        left === 0
          ? 1
          : i >= a.length
            ? 0
            : f(i + 1, left) + f(i + 2, left - 1);
      return f(0, k);
    },
  ),
  add(
    "stable-curation",
    "Stable pigment curation",
    "Sorting",
    "sorting",
    "Return original indices sorted by absolute value ascending; break ties by the smaller original index.",
    "Sort decorated pairs (absolute value, original index).",
    "Tied magnitudes preserve their input order.",
    "O(n log n) time · O(n) space",
    "Sorting signed values is different from sorting their magnitudes.",
    ({ values: a }) =>
      a
        .map((_, i) => i)
        .sort((i, j) => Math.abs(a[i]) - Math.abs(a[j]) || i - j),
  ),
  add(
    "inversion-ledger",
    "Misordered frame ledger",
    "Sorting",
    "sorting",
    "Count pairs i<j with values[i]>values[j]. Equal values do not form an inversion.",
    "Merge sorted halves; a right value chosen before remaining left values creates that many inversions.",
    "Each pair is counted at the merge that separates its endpoints.",
    "O(n log n) time · O(n) space using merge counting",
    "Use strict comparison so duplicate values do not count.",
    ({ values: a }) => {
      let r = 0;
      for (let i = 0; i < a.length; i++)
        for (let j = i + 1; j < a.length; j++) r += +(a[i] > a[j]);
      return r;
    },
  ),
  add(
    "tree-inorder",
    "Branch gallery walk",
    "Binary trees",
    "trees",
    "Interpret values as a complete binary tree in level order: children of i are 2i+1 and 2i+2 if in range. Return its inorder values (left, node, right).",
    "Recurse into the left subtree, visit the node, then traverse the right subtree.",
    "The current call emits exactly its subtree in inorder.",
    "O(n) time · O(log(n+1)) stack for this complete tree, plus output",
    "The array's input order is level order, not inorder.",
    ({ values: a }) => treeFold(a, 0),
  ),
  add(
    "tree-levels",
    "Light on each tree level",
    "Binary trees",
    "trees",
    "Interpret values as a complete binary tree in level order. Return the sum at each depth, starting with the root level. Empty input returns [].",
    "Use a queue with level boundaries, or derive depth from the array index.",
    "A level accumulator contains only nodes at that depth.",
    "O(n) time · O(n) space with a BFS queue",
    "Reset the accumulator at each level.",
    ({ values: a }) => {
      const r: number[] = [];
      a.forEach((x, i) => {
        const d = Math.floor(Math.log2(i + 1));
        r[d] = (r[d] || 0) + x;
      });
      return r;
    },
  ),
  add(
    "bst-rank",
    "Catalog tree rank",
    "Search trees",
    "trees",
    "Insert values into a BST, ignoring duplicate values. Return its kth smallest distinct value (k starts at 1), or -1 if absent.",
    "Inorder traversal of a BST visits distinct keys in sorted order.",
    "The visited count is the rank among unique keys.",
    "O(n²) worst-case build + O(n) traversal · O(n) space for an unbalanced BST",
    "Duplicates do not create extra ranks.",
    ({ values: a, k }) => sorted([...new Set(a)])[k - 1] ?? -1,
  ),
  add(
    "bst-range",
    "Catalog range count",
    "Search trees",
    "trees",
    "Insert values into a BST ignoring duplicates. Count distinct keys in the inclusive range [-k,k].",
    "Prune subtrees that cannot intersect the query interval.",
    "Keys in the left subtree are smaller and keys in the right subtree are larger.",
    "O(n²) worst-case build + O(n) query · O(n) space",
    "Both range endpoints are included.",
    ({ values: a, k }) =>
      [...new Set(a)].filter((x) => x >= -k && x <= k).length,
  ),
  add(
    "heap-reserve",
    "Reserve pigment heap",
    "Heaps",
    "heaps",
    "Return the k largest values in descending order, or all values if n<k. Preserve duplicates.",
    "Keep a min-heap of at most k candidates; eject the smallest when it overflows.",
    "The heap contains the largest min(k,seen) values processed so far.",
    "O(n log(k+1) + k log(k+1)) time · O(k) extra space",
    "A set would incorrectly discard equal-valued items.",
    ({ values: a, k }) => sorted(a).reverse().slice(0, k),
  ),
  add(
    "merge-cost",
    "Canvas roll joining cost",
    "Heaps",
    "heaps",
    "Roll lengths are |values[i]|+1. Joining any two rolls costs their total length and creates one roll of that length. Return the minimum total cost to join all rolls; zero or one roll costs 0.",
    "Repeatedly extract the two smallest lengths, pay their sum, and reinsert it.",
    "The heap contains exactly the rolls still available for joining.",
    "O(n log n) time · O(n) space",
    "Charge each intermediate joined roll again when it participates in another join.",
    ({ values: a }) => {
      const h = a.map((x) => Math.abs(x) + 1);
      let cost = 0;
      while (h.length > 1) {
        h.sort((a, b) => a - b);
        const v = h.shift()! + h.shift()!;
        cost += v;
        h.push(v);
      }
      return cost;
    },
  ),
  add(
    "gallery-hops",
    "Gallery network hop count",
    "Graph traversal",
    "graphs",
    graphContract +
      " Return the fewest edges from vertex 0 to vertex n−1, ignoring weights.",
    "Use BFS on the directed unweighted network.",
    "A vertex's first BFS distance is its shortest hop count.",
    "O(V+E) time · O(V+E) space with adjacency lists",
    "Weighted shortest distance and fewest hops are different objectives.",
    ({ values: a }) => bfs(a),
  ),
  add(
    "gallery-paths",
    "Gallery network route count",
    "Graph traversal",
    "graphs",
    graphContract +
      " Return the number of directed paths from 0 to n−1. For one vertex, the empty path counts as 1.",
    "All edges point to higher indices, so propagate path counts in index order.",
    "Before processing u, every incoming contribution to u is complete.",
    "O(V+E) time · O(V+E) space",
    "A single-vertex graph has one source-to-itself path.",
    ({ values: a }) => {
      if (!a.length) return 0;
      const d = a.map(() => 0);
      d[0] = 1;
      for (let i = 0; i < a.length; i++)
        for (const [u, v] of edges(a)) if (u === i) d[v] += d[u];
      return d.at(-1)!;
    },
  ),
  add(
    "gallery-distance",
    "Least-cost gallery route",
    "Shortest paths",
    "graphs",
    graphContract + " Return the minimum total edge weight from 0 to n−1.",
    "Relax outgoing edges in topological index order; this network is a DAG.",
    "A vertex's minimum distance is final when its outgoing edges are processed.",
    "O(V+E) time · O(V+E) space for this DAG",
    "Fewest edges need not have the lowest total weight.",
    ({ values: a }) => shortest(a),
  ),
  add(
    "gallery-budget",
    "Reachable under the lighting budget",
    "Shortest paths",
    "graphs",
    graphContract +
      " Count vertices whose shortest weighted distance from 0 is at most k, including 0 itself when present.",
    "Compute all source distances, then compare each final distance with k.",
    "Each relaxation preserves an upper bound on a real path cost.",
    "O(V+E) time · O(V+E) space for this DAG",
    "Count the source: its distance is zero.",
    ({ values: a, k }) => {
      if (!a.length) return 0;
      const d = a.map(() => Infinity);
      d[0] = 0;
      for (let i = 0; i < a.length; i++)
        for (const [u, v, w] of edges(a))
          if (u === i) d[v] = Math.min(d[v], d[u] + w);
      return d.filter((x) => x <= k).length;
    },
  ),
  add(
    "pigment-clusters",
    "Connected pigment clusters",
    "Disjoint sets",
    "graphs",
    "Create one vertex per input position. Connect i and j when |values[i]-values[j]|<=k. Return the number of connected components, with 0 for empty input.",
    "Union endpoints of each qualifying pair, then count distinct roots.",
    "Two vertices have the same root exactly when processed links connect them.",
    "O(n² α(n)) with path compression and union by rank · O(n) space",
    "Connectivity is transitive even when the endpoints themselves differ by more than k.",
    ({ values: a, k }) => components(a, k),
  ),
  add(
    "cluster-bridges",
    "Bridges between pigment groups",
    "Disjoint sets",
    "graphs",
    "Connect positions i,j when |values[i]-values[j]|<=k. Return the fewest additional arbitrary edges needed to make all positions connected. Empty input returns 0.",
    "First find the number c of components. Each new edge can reduce c by at most one.",
    "A bridge joining two different components reduces the component count by one.",
    "O(n² α(n)) with an optimized disjoint set · O(n) space",
    "Already connected groups require zero new edges.",
    ({ values: a, k }) => Math.max(0, components(a, k) - 1),
  ),
  add(
    "greedy-purchases",
    "Small works acquisition",
    "Greedy algorithms",
    "greedy",
    "Artwork i costs |values[i]|+1. With budget 5k, return the maximum number of works you can buy; each is available once.",
    "Buy the cheapest remaining work first.",
    "For any count, the chosen prefix has the minimum possible total cost.",
    "O(n log n) time · O(n) space when copying",
    "The objective is the number of works, not spending the entire budget.",
    ({ values: a, k }) => {
      let budget = 5 * k,
        count = 0;
      for (const x of sorted(a.map((x) => Math.abs(x) + 1))) {
        if (x > budget) break;
        budget -= x;
        count++;
      }
      return count;
    },
  ),
  add(
    "studio-schedule",
    "Quiet studio appointment schedule",
    "Greedy algorithms",
    "greedy",
    "Each value x defines a half-open appointment [x,x+k). Return the maximum number of nonoverlapping appointments; finishing at another's start is allowed.",
    "Sort by finishing time and repeatedly choose the next appointment starting at or after the last finish.",
    "The chosen schedule leaves the earliest possible finish for its current size.",
    "O(n log n) time · O(n) copied storage",
    "Use >= for touching half-open intervals.",
    ({ values: a, k }) => {
      let end = -Infinity,
        count = 0;
      for (const x of sorted(a))
        if (x >= end) {
          count++;
          end = x + k;
        }
      return count;
    },
  ),
  add(
    "rising-study",
    "Rising color study",
    "Dynamic programming",
    "dp",
    "Return the length of a strictly increasing subsequence; it need not be contiguous. Empty input returns 0.",
    "Let dp[i] be the longest increasing subsequence ending at i; extend smaller earlier values.",
    "Each dp[i] is optimal among subsequences whose final position is i.",
    "O(n²) time · O(n) space for this recurrence",
    "Equal values cannot extend a strictly increasing subsequence.",
    ({ values: a }) => lis(a),
  ),
  add(
    "nonadjacent-profit",
    "Spaced exhibition value",
    "Dynamic programming",
    "dp",
    "Select nonadjacent input positions to maximize their sum. Selecting nothing is allowed, so the result is never negative.",
    "Maintain best results for skipping or taking the current position.",
    "The take state extends only a state that skipped the previous position.",
    "O(n) time · O(1) extra space",
    "For all-negative input, the empty choice wins with zero.",
    ({ values: a }) => {
      let prev = 0,
        best = 0;
      for (const x of a) {
        const next = Math.max(best, prev + x);
        prev = best;
        best = next;
      }
      return best;
    },
  ),
  add(
    "trie-prefix",
    "Botanical prefix archive",
    "Tries",
    "advanced",
    "Map x using |x|%9 into [ink,iris,ivy,oak,ochre,olive,rose,reed,ruby]. Insert distinct words into a trie. Return the number of distinct words beginning with i.",
    "Insert one character at a time and count terminal nodes beneath prefix i.",
    "A trie node represents exactly the characters on its root-to-node path.",
    "O(L) time and space, L total characters",
    "Repeated words count once, and prefix nodes are not necessarily complete words.",
    ({ values: a }) => new Set(words(a).filter((x) => x.startsWith("i"))).size,
  ),
  add(
    "trie-nodes",
    "Archive trie node budget",
    "Tries",
    "advanced",
    "Map x using |x|%9 into [ink,iris,ivy,oak,ochre,olive,rose,reed,ruby]. Return the number of trie nodes required for those words, including the root. Empty input needs one root node.",
    "Every distinct nonempty prefix needs one node; shared prefixes reuse nodes.",
    "There is a one-to-one correspondence between nonroot nodes and distinct nonempty prefixes.",
    "O(L) time and space with a trie, L total characters",
    "Do not allocate a new root for each word.",
    ({ values: a }) => {
      const p = new Set<string>();
      words(a).forEach((w) => {
        for (let i = 1; i <= w.length; i++) p.add(w.slice(0, i));
      });
      return p.size + 1;
    },
  ),
  add(
    "bit-lights",
    "Lighting panel bit count",
    "Bit manipulation",
    "advanced",
    "Replace each x with |x|. XOR all values, then return the number of set bits in the result; empty input returns 0.",
    "XOR folds the values. Clear one set bit per iteration with x &= x−1.",
    "Each clearing step removes exactly the lowest remaining set bit.",
    "O(n+b) time · O(1) space, b set bits",
    "Take absolute values before XOR; signed bit patterns have different meanings.",
    ({ values: a }) => {
      let x = a.reduce((s, x) => s ^ Math.abs(x), 0),
        c = 0;
      while (x) {
        x &= x - 1;
        c++;
      }
      return c;
    },
  ),
  add(
    "bit-union",
    "Shared lighting channels",
    "Bit manipulation",
    "advanced",
    "Replace each x with |x| and OR all values. Return that integer; empty input returns 0.",
    "Bitwise OR remembers any channel enabled by any panel.",
    "A result bit is set exactly when a processed value has that bit set.",
    "O(n) time · O(1) space",
    "OR is not arithmetic addition; shared bits are not counted twice.",
    ({ values: a }) => a.reduce((s, x) => s | Math.abs(x), 0),
  ),
  add(
    "gcd-grid",
    "Common canvas grid",
    "Number theory",
    "complexity",
    "Return the greatest common divisor of the absolute input values. Define gcd of empty input or all zeros as 0.",
    "Fold Euclid's algorithm across the values.",
    "Replacing (a,b) with (b,a%b) preserves their common divisors.",
    "O(n log(M+1)) time · O(1) space, M largest magnitude",
    "gcd(0,x)=|x|, so zeros must not be skipped by a division-by-zero operation.",
    ({ values: a }) => {
      const gcd = (x: number, y: number): number => (y ? gcd(y, x % y) : x);
      return a.reduce((s, x) => gcd(s, Math.abs(x)), 0);
    },
  ),
  add(
    "prime-pigments",
    "Prime numbered pigments",
    "Number theory",
    "complexity",
    "Count input positions whose absolute value is prime; repeated primes count repeatedly, and 0 and 1 are not prime.",
    "Trial-divide each candidate only up to its square root.",
    "A composite number must have a factor no larger than its square root.",
    "O(n sqrt(M)) time · O(1) space",
    "One is not a prime number.",
    ({ values: a }) =>
      a.filter((x) => {
        x = Math.abs(x);
        if (x < 2) return false;
        for (let d = 2; d * d <= x; d++) if (x % d === 0) return false;
        return true;
      }).length,
  ),
  add(
    "matrix-diagonal",
    "Mosaic diagonal budget",
    "Matrices",
    "arrays",
    "Fill the smallest square grid that can hold values, row by row, padding with zeros. Return the main diagonal sum. Empty input returns 0.",
    "A diagonal cell (r,r) has flattened index r*width+r.",
    "Every visited index corresponds to one main diagonal cell.",
    "O(sqrt(n)) time · O(1) space without materializing the grid",
    "Include padded zero cells when reasoning about the square's dimensions.",
    ({ values: a }) => {
      const w = Math.ceil(Math.sqrt(a.length));
      let s = 0;
      for (let r = 0; r < w; r++) s += a[r * w + r] || 0;
      return s;
    },
  ),
  add(
    "matrix-transpose",
    "Rotated mosaic ledger",
    "Matrices",
    "arrays",
    "Fill the smallest square grid that can hold values, row by row, padding with zeros. Transpose it and return the flattened row-major array; empty input returns [].",
    "Transpose swaps row and column coordinates.",
    "The output cell (r,c) receives the original cell (c,r).",
    "O(n) time and output space",
    "Transposing is reflection across the diagonal, not a 90-degree rotation.",
    ({ values: a }) => {
      const w = Math.ceil(Math.sqrt(a.length));
      return Array.from(
        { length: w * w },
        (_, i) => a[(i % w) * w + Math.floor(i / w)] || 0,
      );
    },
  ),
  add(
    "interval-union",
    "Gallery light coverage",
    "Intervals",
    "greedy",
    "Each x creates the closed interval [x,x+k]. Merge intervals that overlap or touch. Return merged [start,end] pairs sorted by start.",
    "Sort by start, then extend the current interval while the next one overlaps.",
    "The output before the last interval is final and disjoint.",
    "O(n log n) time · O(n) output space",
    "Touching closed intervals merge.",
    ({ values: a, k }) => intervalMerge(a, k),
  ),
  add(
    "interval-length",
    "Painted rail length",
    "Intervals",
    "greedy",
    "Each x paints the real-number interval [x,x+k]. Return the total length covered by their union. Empty input returns 0.",
    "Merge overlaps before summing end-start for each disjoint interval.",
    "Merged intervals cover exactly the same points as the original intervals.",
    "O(n log n) time · O(n) space",
    "Real interval length is end-start, without an extra +1.",
    ({ values: a, k }) => sum(intervalMerge(a, k).map(([s, e]) => e - s)),
  ),
];
