// GMHikaru
import { fetchYTIChannel } from '../../src/utils/mediafetch/ytbchannel';
import fetcher from '../../src/utils/mediafetch/bilivideo';
test('bilivideo', async () => {
  const result = await fetchYTIChannel('@MioriCelesta');
  console.log(result);
  return;
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/video/BV1KW4y1p7oT/?spm_id_from=333.999.0.0'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
