import fetcher from '@utils/mediafetch/bilicolle';
test('bilicolle', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/529249/channel/collectiondetail?sid=2248501'
    ),
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
