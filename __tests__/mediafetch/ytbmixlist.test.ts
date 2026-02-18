import fetcher from '../../src/utils/mediafetch/ytbmixlist';

test('ytbmixlist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch2.exec('youtu.be/list=RDUz0qOlFZN0s')!,
  });
  console.log(content?.songList);
  expect(content?.songList[0]?.id).not.toBeUndefined();
}, 30000);
