import fetcher from '../../src/utils/mediafetch/ytbvideo';
import { resolveURL as resolveURLMuse } from '../../src/utils/mediafetch/ytbvideo.muse';
import {
  resolveURL as resolveURLYtbi,
  suggest,
} from '../../src/utils/mediafetch/ytbvideo.ytbi';

test('test ytbvideo', async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      'https://www.youtube.com/watch?v=VtXTFi8edyE',
    ),
  });
  //console.log(content);
  expect(content.songList[0]?.id).not.toBeUndefined();
}, 220000);

const dummySong = { bvid: 'VtXTFi8edyE' };

test('test libmuse', async () => {
  const content = await resolveURLMuse(dummySong);
  //console.log(content);
  expect(content).not.toBeNull();
}, 220000);

test('test ytbi', async () => {
  const content = await resolveURLYtbi(dummySong);
  //console.log(content);
  expect(content).not.toBeNull();
}, 2201000);
