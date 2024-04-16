import qqLrcFetch from '../../src/utils/lrcfetch/qqqrc';
test('qq lrc', async () => {
  const lrcContent = await qqLrcFetch.getLyric('5023727');
  expect(lrcContent.length).not.toBe(0);
}, 9999);
