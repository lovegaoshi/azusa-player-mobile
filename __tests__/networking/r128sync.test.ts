import { downloadGZippedR128GainDB } from '@components/setting/plugins/r128gain/Sync';

test('Get GitHub zipped R128Gain content', async () => {
  const content = await downloadGZippedR128GainDB();
  expect(Array.isArray(content)).toBe(true);
});
