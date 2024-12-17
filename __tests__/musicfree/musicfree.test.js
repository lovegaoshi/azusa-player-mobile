import { promises as fs } from 'fs';
import { loadEvalPlugin } from '../../src/utils/mediafetch/evalsdk';

test('eval mfsdk', async () => {
  const data = await fs.readFile('__tests__/musicfree/mfexample.js', 'utf8');
  const func = loadEvalPlugin(data);
  const search = await func.regexFetch({ url: 'wake' });
  expect(search.songList.length).not.toBe(0);
  const song = search.songList[0];
  const resolvedURL = await func.resolveURL(song);
  expect(resolvedURL).not.toBe(null);
});
