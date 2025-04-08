import bs from '../../src/utils/binarySearch';

test('bs', async () => {
  const comparator = (element, needle) => {
    return element - needle;
  };
  const data = [1, 2, 4, 5];
  const res = bs({
    dataLen: data.length,
    target: 3,
    comparator,
    getData: index => data[index],
  });
  expect(res).toBe(-3);
}, 10000);
