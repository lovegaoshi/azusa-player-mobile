import { ytClientWeb } from '../../src/utils/mediafetch/ytbi';

test('test ytbvideo', async () => {
  const client = await ytClientWeb;
  console.log(await client.music.getHomeFeed());
}, 220000);
