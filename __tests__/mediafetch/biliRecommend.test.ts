import fetchRanking from '../../src/utils/mediafetch/biliRegionRecommend';
test('biliRegionRecommend', async () => {
  const content = await fetchRanking();
  // console.log(content);
  expect(content[0]?.id).not.toBeUndefined();
}, 50000);
