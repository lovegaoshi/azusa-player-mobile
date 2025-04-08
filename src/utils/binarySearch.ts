interface Props<T> {
  dataLen: number;
  getData: (index: number) => T;
  target: T;
  comparator: (a: T, b: T) => number;
  low?: number;
  high?: number;
}

export default <T>({
  dataLen,
  getData,
  target,
  comparator,
  low = 0,
  high = dataLen - 1,
}: Props<T>) => {
  let mid: number, cmp: number;
  while (low <= high) {
    // The naive `low + high >>> 1` could fail for array lengths > 2**31
    // because `>>>` converts its operands to int32. `low + (high - low >>> 1)`
    // works for array lengths <= 2**32-1 which is also Javascript's max array
    // length.
    mid = low + ((high - low) >>> 1);
    cmp = +comparator(getData(mid), target);

    // Too low.
    if (cmp < 0.0) low = mid + 1;
    // Too high.
    else if (cmp > 0.0) high = mid - 1;
    // Key found.
    else return mid;
  }

  // Key not found.
  return ~low;
};
