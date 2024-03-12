import fetcher from '@utils/mediafetch/biliAudioSimilar';

test('biliAudioSimilar', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/audio/similarsongs/3680653'
    ),
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
