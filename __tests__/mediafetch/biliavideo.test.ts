import fetcher from '../../src/utils/mediafetch/biliavideo';

test('biliavideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec('av43867326')!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
