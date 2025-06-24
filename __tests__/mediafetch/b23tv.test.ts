import fetcher from '../../src/utils/mediafetch/b23tv';

test('b23tv', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec('https://b23.tv/BV1KZ4y1j7hS')!,
  });
  // console.log(content);
  expect(content.startsWith('https://www.bilibili.com')).toBe(true);
});
