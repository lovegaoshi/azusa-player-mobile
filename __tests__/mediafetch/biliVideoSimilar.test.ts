import fetcher from '../../src/utils/mediafetch/biliVideoSimilar';

test('biliVideoSimilar', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'bilibili.com/video/similarvideo/BV1cf421Z7oQ'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
