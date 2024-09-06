import fetcher, {
  fetchVideoPlayUrlPromise,
} from '../../src/utils/mediafetch/bilivideo';

test.only('dummy fetch', () => {
  expect('dummy').toBe('dummy');
});

test('bilivideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/video/BV1aS411A7ir'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeUndefined();

  const playurl = await fetchVideoPlayUrlPromise({ bvid: 'BV1aS411A7ir' });
  // console.log(playurl);

  expect(playurl.url).not.toBeUndefined();
});
