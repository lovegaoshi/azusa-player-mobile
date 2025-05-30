import shuffle from 'lodash/shuffle';

import { randomNumber } from './Utils';

/**
 * shuffleObjectsNoAdjacentDuplicates.
 * this is fast when there are many commmon objects. GPT you failed me
 * @param objects
 * @param getKey
 * @returns
 */
export function shuffleObjectsNoAdjacentDuplicates<T>(
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

/**
 * this bets on the initial shuffle is random enough with not so similar songlist
 * worst is still n! but should be ok
 * @param objects
 * @param getKey
 * @returns
 */
export const dumberShuffle = <T>(
  objects: T[],
  getKey: (v: T) => string = v => v as any,
) => {
  // first shuffle the list;
  const shuffled = shuffle(objects);
  // then loop from item 1, compare to the next;
  const arrLength = shuffled.length;
  for (const [i, value] of shuffled.entries()) {
    // if item is the 3rd last item, there is no point to swap at all.
    if (i > arrLength - 3) break;
    // if different, next;
    if (getKey(shuffled[i]) !== getKey(shuffled[i + 1])) continue;
    // if same, get the rest of array, filter, then get a random index; swap with next.
    const rest = shuffled.slice(i + 2).filter(v => getKey(v) !== getKey(value));
    const randomIndex = randomNumber(rest.length);
    const tmp = rest[i + 1];
    shuffled[i + 1] = rest[randomIndex];
    rest[randomIndex] = tmp;
  }
  return shuffled;
};

export const smartShuffle = (v: NoxMedia.Song[]) => {
  try {
    return dumberShuffle(v, v => v.parsedName);
  } catch {
    return shuffle(v);
  }
};

export default (smart = true) => {
  return smart ? smartShuffle : shuffle;
};
