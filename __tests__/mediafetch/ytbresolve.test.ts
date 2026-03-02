import fetcher from '../../src/utils/mediafetch/ytbvideo';

test('test ytbvideo resolve', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/watch?v=VtXTFi8edyE',
    ),
  });
  const song = content.songList[0];
  const resolved = await fetcher.resolveURL(song);
  console.log(resolved);
  expect(resolved?.url).not.toBeUndefined();
}, 220000);
