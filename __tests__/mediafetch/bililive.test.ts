import fetcher from '@utils/mediafetch/bililive';

test('biliLive', async () => {
  const content = await fetcher.regexFetch({ reExtracted: ['', '510'] });
  // console.log(content);
  expect(content).not.toBeNull();
});
