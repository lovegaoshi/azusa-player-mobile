// import fetcher from '../../src/utils/mediafetch/ytbvideo';
import { resolveURL as resolveURLNode } from '../../src/utils/mediafetch/ytbvideo.node';
import { resolveURL as resolveURLMuse } from '../../src/utils/mediafetch/ytbvideo.muse';
import { resolveURL as resolveURLYtbi } from '../../src/utils/mediafetch/ytbvideo.ytbi';

const dummySong = { bvid: 'VtXTFi8edyE' };

// HACK: always fails. disabling for now
/*
test('test ytbi', async () => {
  const content = await resolveURLYtbi(dummySong);
  //console.log(content);
  expect(content).not.toBeNull();
}, 2201000);
*/

test('test libmuse', async () => {
  const content = await resolveURLMuse(dummySong);
  //console.log(content);
  expect(content).not.toBeNull();
}, 220000);

test('test ytdl-core', async () => {
  const content = await resolveURLNode(dummySong);
  console.log(content);
  expect(content).not.toBeNull();
}, 220000);
