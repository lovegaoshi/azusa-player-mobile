import fetcher from '../../src/utils/mediafetch/ytbPlaylist';

test('ytbplaylist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/watch?v=s-wONyk3RV0&list=OLAK5uy_kShCBhAQCspNHT--pYp_s4TjCoHiPoLQM',
    )!,
  });
  console.log(content?.songList);
  expect(content?.songList[0]?.id).not.toBeUndefined();
}, 30000);
