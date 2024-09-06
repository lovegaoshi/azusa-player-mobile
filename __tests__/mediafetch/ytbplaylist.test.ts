import fetcher from '../../src/utils/mediafetch/ytbPlaylist';

test('ytbplaylist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/playlist?list=PLv4y5OVUmyFjx4uf_sQunpq8nlQiar_iQ'
    )!,
  });
  console.log(content?.songList.length);
  expect(content?.songList[0]?.id).not.toBeUndefined();
}, 30000);
