import { getBVIDFast } from '../../src/utils/mediafetch/bililist';
test('biliList', async () => {
  const content = await getBVIDFast('20159625');
  console.log(content);
  expect(content.length > 0).toBe(true);
}, 33333);
