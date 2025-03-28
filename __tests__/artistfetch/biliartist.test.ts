import getBiliArtist from '../../src/utils/artistfetch/biliartist';
test('biliList', async () => {
  const content = await getBiliArtist('529249');
  console.log(content);
  expect(content.artistName?.length > 0).toBe(true);
}, 33333);
