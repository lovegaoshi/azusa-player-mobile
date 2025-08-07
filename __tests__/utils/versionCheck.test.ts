import { getVersion } from '../../src/utils/versionCheck';

test('versionCheck', async () => {
  const req = await getVersion();
  expect(req.noxCheckedVersion?.includes('v')).toBe(true);
  expect(req.devVersion?.includes('dev')).toBe(true);
  expect(req.noxAPKUrl?.includes('https://')).toBe(true);
}, 10000);
