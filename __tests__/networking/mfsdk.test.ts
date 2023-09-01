import { searcher, MUSICFREE, resolver } from '@utils/mediafetch/mfsdk';

test('test musicfree sdk', async () => {
  const content = await searcher[MUSICFREE.aggregated]('maroon 5', 1, 'music');
  expect((content && Array.isArray(content)) || content === undefined).toBe(
    true
  );
  if (content) {
    const resolvedURL = await resolver[content[0].source](content[0], 'high');
    expect(resolvedURL.not.toBeNull());
  }
}, 220000);
