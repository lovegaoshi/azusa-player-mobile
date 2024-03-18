import fetcher from '../../src/utils/mediafetch/biliseries';
test('biliseries', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/3493085134719196/channel/seriesdetail?sid=2790798'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
