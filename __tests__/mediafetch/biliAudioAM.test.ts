import fetcher from '@utils/mediafetch/biliAudioAM';

test('biliAudioAM', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/audio/am10624'
    ),
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
