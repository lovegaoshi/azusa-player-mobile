import { ytwebClient } from '../../src/utils/mediafetch/ytbi';

test('test ytbvideo', async () => {
  const client = await ytwebClient;
  console.log(await client.music.getHomeFeed());
}, 220000);
