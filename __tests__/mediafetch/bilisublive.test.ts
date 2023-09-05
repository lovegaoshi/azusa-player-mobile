import fetcher from '@utils/mediafetch/bilisublive';

test('bilisubLive', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: ['', '6666'],
  });
  console.log(content);
  expect(content).not.toBeNull();
}, 250000);
