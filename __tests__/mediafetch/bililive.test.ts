import fetcher from '../../src/utils/mediafetch/bililive';

test('biliLive', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://live.bilibili.com/510'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
