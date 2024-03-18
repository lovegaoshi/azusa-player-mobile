import fetcher from '../../src/utils/mediafetch/b23tv';

test('b23tv', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec('https://b23.tv/114514')!,
  });
  // console.log(content);
  expect(content.startsWith('https://')).toBe(true);
});
