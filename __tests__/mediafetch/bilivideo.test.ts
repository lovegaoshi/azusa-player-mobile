import fetcher, {
  fetchVideoPlayUrlPromise,
} from '../../src/utils/mediafetch/bilivideo';
test('bilivideo', async () => {
  expect('bilivideo').toBe('bilivideo');
  /*
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/video/BV1aS411A7ir'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();

   */
  const playurl = await fetchVideoPlayUrlPromise({ bvid: 'BV1aS411A7ir' });
  // console.log(playurl);

  expect(playurl.url).not.toBeNull();
});
