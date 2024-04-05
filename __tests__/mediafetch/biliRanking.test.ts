import { fetchRanking } from '../../src/utils/mediafetch/biliRanking';
test('bilicolle', async () => {
  const content = await fetchRanking();
  // console.log(content);
  expect(Object.values(content)[0][0]?.id).not.toBeNull();
}, 50000);
