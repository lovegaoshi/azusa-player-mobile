import fetcher from '../../src/utils/mediafetch/biliFavColle';
test('FavColle', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/529249/favlist?fid=1061551&ftype=collect&ctype=21'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeUndefined();
});
