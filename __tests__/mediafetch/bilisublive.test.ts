import fetcher from '../../src/utils/mediafetch/bilisublive';

test('bilisubLive', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://space.bilibili.com/3493085134719196/fans/follow?spm_id_from=333.1365.my-info.follow.click'
    )!,
  });
  expect(content.songList).not.toBeNull();
}, 250000);
