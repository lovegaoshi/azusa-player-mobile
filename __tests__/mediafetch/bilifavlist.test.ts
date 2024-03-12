import fetcher from '@utils/mediafetch/bilifavlist';
test('bilifavlist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/529249/favlist?fid=1656066449&ftype=create'
    ),
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
