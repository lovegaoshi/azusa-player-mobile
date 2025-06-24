import fetcher from '../../src/utils/mediafetch/bilifavlist';
test('bilifavlist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/3493085134719196/favlist?fid=2446762296&ftype=create',
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeUndefined();
});
