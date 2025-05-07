/**
 * shuffleObjectsNoAdjacentDuplicates. cortesy of chatGPT
 * @param objects
 * @param getKey
 * @returns
 */
export function smartShuffle<T>(
  objects: T[],
  getKey: (v: T) => string = v => v as any,
) {
  const freqMap = new Map();

  // Step 1: Count frequencies based on .name
  for (const obj of objects) {
    const name = getKey(obj);
    if (!freqMap.has(name)) freqMap.set(name, []);
    freqMap.get(name).push(obj);
  }

  const total = objects.length;
  const maxAllowed = Math.floor((total + 1) / 2);
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  for (const [_, group] of freqMap) {
    if (group.length > maxAllowed) {
      throw new Error('Cannot arrange without adjacent duplicates.');
    }
  }

  // Step 2: Convert to "heap" based on group size
  const heap = Array.from(freqMap.entries());
  heap.sort(() => Math.random() - 0.5); // Shuffle first
  heap.sort((a, b) => b[1].length - a[1].length); // Then sort by count

  const result = [];
  let prevName = null;

  while (result.length < total) {
    let i = 0;

    // Step 3: Find the first group with a different name
    while (i < heap.length && heap[i][0] === prevName) i++;

    if (i === heap.length) throw new Error('No valid arrangement found.');

    // Step 4: Pick an object from that group
    const [name, group] = heap[i];
    const obj = group.pop();
    result.push(obj);
    prevName = name;

    // Remove group if empty
    if (group.length === 0) {
      heap.splice(i, 1);
    }

    // Shuffle and re-sort for randomness and priority
    heap.sort(() => Math.random() - 0.5); // Optional
    heap.sort((a, b) => b[1].length - a[1].length);
  }

  return result;
}
