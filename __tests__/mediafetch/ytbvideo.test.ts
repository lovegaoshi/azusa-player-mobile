import fetcher from '../../src/utils/mediafetch/ytbvideo';

test('test ytbvideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/watch?v=VtXTFi8edyE',
    ),
  });
  //console.log(content);
  expect(content.songList[0]?.id).not.toBeUndefined();
}, 220000);
