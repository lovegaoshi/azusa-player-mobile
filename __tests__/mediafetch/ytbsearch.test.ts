import fetcher from '@utils/mediafetch/ytbsearch';
test('ytbsearch', async () => {
  const content = await fetcher.regexFetch({
    url: 'wake',
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
