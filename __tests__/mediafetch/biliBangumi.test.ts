import fetcher from '../../src/utils/mediafetch/biliBangumi';

test('biliBangumi', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.bilibili.com/bangumi/play/ep414451'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
