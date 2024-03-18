import fetcher from '../../src/utils/mediafetch/bilichannel';

test('biliChannel', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/529249/video?tid=129&special_type=&pn=1&keyword=&order=pubdate'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
