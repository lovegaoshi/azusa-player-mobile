import fetcher from '../../src/utils/mediafetch/ytbsearch';
test('ytbsearch', async () => {
  const content = await fetcher.regexFetch({
    url: "don't wake up",
    progressEmitter: () => {},
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
