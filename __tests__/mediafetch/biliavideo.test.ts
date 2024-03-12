import fetcher from '@utils/mediafetch/biliavideo';

test('biliavideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/audio/au3680653?type=3&spm_id_from=333.999.0.0'
    ),
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
