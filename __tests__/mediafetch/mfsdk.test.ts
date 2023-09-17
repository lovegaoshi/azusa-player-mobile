import { searcher, MUSICFREE, resolver } from '@utils/mediafetch/mfsdk';

test('test musicfree sdk', async () => {
  const content = await searcher[MUSICFREE.fivesing]('maroon 5', 1, 'music');
  expect((content && Array.isArray(content)) || content === undefined).toBe(
    true
  );
  return;
  // resolver likely wont work with a foreign IP (github)
  if (content) {
    const resolvedURL = await resolver[content[0].source](content[0], 'high');
    expect(resolvedURL.not.toBeNull());
  }
}, 220000);
