import { downloadGZippedR128GainDB } from '../../src/components/setting/plugins/r128gain/Sync';

test('Get GitHub zipped R128Gain content', async () => {
  const content = await downloadGZippedR128GainDB();
  console.log(content);
  expect(Array.isArray(content)).toBe(true);
});
