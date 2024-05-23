import qqLrcFetch from "../../src/utils/lrcfetch/qq";
test("qq lrc", async () => {
  const content = await qqLrcFetch.getLrcOptions("hillsong young wake");
  expect(content[0].key).not.toBeNull();
  const lrcContent = await qqLrcFetch.getLyric("001lRZ0z3XBRIj");
  expect(lrcContent.length).not.toBe(0);
});
