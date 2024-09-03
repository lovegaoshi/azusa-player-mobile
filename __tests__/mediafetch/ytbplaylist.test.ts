import fetcher from '../../src/utils/mediafetch/ytbplaylist.muse';
test('ytbplaylist', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/watch?v=nyvehUgBc3g&list=PLbpi6ZahtOH7lIn0YG_BhuzoKxQeJWsxY'
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
}, 30000);
