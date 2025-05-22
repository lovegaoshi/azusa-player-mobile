import lrcFetch from '../../src/utils/lrcfetch/netease';
import { getLyric } from '../../src/utils/lrcfetch/neteaseEapi';

test('netease lrc', async () => {
  const content = await lrcFetch.getLrcOptions('starship III');
  expect(content[0].key).not.toBeNull();
  const lrcContent = await lrcFetch.getLyric(content[0].key);
  expect(lrcContent.length).not.toBe(0);
});
