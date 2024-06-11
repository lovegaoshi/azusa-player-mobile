import fetcher, {
  fetchVideoPlayUrlPromise,
} from '../../src/utils/mediafetch/bilivideo';
test('bilivideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/video/BV1KW4y1p7oT/?spm_id_from=333.999.0.0'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();

  const playurl = await fetchVideoPlayUrlPromise({ bvid: 'BV1KW4y1p7oT' });
  // console.log(playurl);

  expect(playurl.url).not.toBeNull();
});
