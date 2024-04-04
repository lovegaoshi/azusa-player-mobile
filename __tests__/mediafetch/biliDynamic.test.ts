import { fetchDynamic } from '../../src/utils/mediafetch/biliDynamic';
test('bilicolle', async () => {
  const content = await fetchDynamic();
  // console.log(content);
  expect(Object.values(content)[0][0]?.id).not.toBeNull();
}, 50000);
