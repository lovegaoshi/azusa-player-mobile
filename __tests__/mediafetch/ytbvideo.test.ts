import { get_song } from 'libmuse';
import ytdl from 'ytdl-core';
// import fetcher from '../../src/utils/mediafetch/ytbvideo';

/*
test('ytbressolve', async () => {
  const content = await fetcher.resolveURL({ bvid: 'VtXTFi8edyE' });
  expect(content?.url).not.toBeNull();
}, 22222);
*/

test('test libmuse', async () => {
  const content = await get_song('VtXTFi8edyE');
  //console.log(content);
  expect(content).not.toBeNull();
}, 220000);

test('test ytdl-core', async () => {
  const ytdlInfo = await ytdl.getInfo(
    `https://www.youtube.com/watch?v=VtXTFi8edyE`
  );
  const formats = ytdlInfo.formats.filter(format =>
    format.codecs.includes('mp4a')
  );
  const content = ytdl.chooseFormat(formats, { quality: 'highestaudio' });
  expect(content).not.toBeNull();
}, 220000);
