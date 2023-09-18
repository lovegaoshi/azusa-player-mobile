import { get_song } from 'libmuse';

test('test libmuse', async () => {
  const content = await get_song('VtXTFi8edyE');
  expect(content).not.toBeNull();
}, 220000);
