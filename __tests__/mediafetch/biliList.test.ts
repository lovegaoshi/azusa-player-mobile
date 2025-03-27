import { getBVID } from '../../src/utils/mediafetch/bililist';
test('biliList', async () => {
  const content = await getBVID('20159625');
  console.log(content);
  expect(content.length > 0).toBe(true);
}, 33333);
