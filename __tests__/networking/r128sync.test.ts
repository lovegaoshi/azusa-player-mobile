import { downloadR128GainDB } from '../../src/components/setting/developer/plugins/r128gain/Sync';

test('Get GitHub zipped R128Gain content', async () => {
  const content = await downloadR128GainDB();
  expect(content).toBeUndefined();
});
