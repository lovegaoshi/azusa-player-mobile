import fetcher from '../../src/utils/mediafetch/acfunvideo';

test('acfunvideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.acfun.cn/v/ac46370925'
    )!,
  });
  expect(content?.songList[0]?.id).not.toBeUndefined();
});
