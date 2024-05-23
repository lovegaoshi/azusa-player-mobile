import { get_song } from "libmuse";
import ytdl from "ytdl-core";

test("test libmuse", async () => {
  const content = await get_song("VtXTFi8edyE");
  expect(content).not.toBeNull();
}, 220000);

test("test ytdl-core", async () => {
  const ytdlInfo = await ytdl.getInfo(
    `https://www.youtube.com/watch?v=VtXTFi8edyE`,
  );
  const formats = ytdlInfo.formats.filter((format) =>
    format.codecs.includes("mp4a"),
  );
  const content = ytdl.chooseFormat(formats, { quality: "highestaudio" });
  expect(content).not.toBeNull();
}, 220000);
