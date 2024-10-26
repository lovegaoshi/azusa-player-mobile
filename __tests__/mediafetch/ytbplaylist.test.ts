import fetcher from '../../src/utils/mediafetch/ytbPlaylist';

test('ytbplaylist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/watch?v=s-wONyk3RV0&list=PLhW2xUEb-B-Y92Q1wVWw6TyMNr4idD-yv',
    )!,
  });
  console.log(content?.songList.length);
  expect(content?.songList[0]?.id).not.toBeUndefined();
}, 30000);
