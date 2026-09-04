import { fetchDynamic } from '../../src/utils/mediafetch/biliDynamic';
test('biliDynamic', async () => {
  // HACK: this API wont return anything anymore as of 260903
  return;
  const content = await fetchDynamic();
  // console.log(content);
  expect(Object.values(content)[0][0]?.id).not.toBeUndefined();
}, 50000);
