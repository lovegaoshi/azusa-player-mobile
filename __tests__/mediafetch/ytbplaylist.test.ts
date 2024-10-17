import fetcher from '../../src/utils/mediafetch/ytbPlaylist';

test('ytbplaylist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/playlist?list=PL-mVqujjjwGjZu3wli3iOh0FBdSU6tsNO'
    )!,
  });
  console.log(content?.songList.length);
  expect(content?.songList[0]?.id).not.toBeUndefined();
}, 30000);
