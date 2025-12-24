import fetcher from '../../src/utils/mediafetch/bilisearch';
test('biliseries', async () => {
  const content = await fetcher.regexFetch({ url: 'wake', fastSearch: true });
  console.log(content);
  expect(content?.songList[0]?.id).not.toBeUndefined();
});
