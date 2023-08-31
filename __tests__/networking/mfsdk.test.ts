import { searcher, MUSICFREE } from '@utils/mediafetch/mfsdk';

test('test musicfree sdk', async () => {
  const content = await searcher[MUSICFREE.aggregated]('maroon 5', 1, 'music');
  expect((content && Array.isArray(content)) || content === undefined).toBe(
    true
  );
}, 20000);
