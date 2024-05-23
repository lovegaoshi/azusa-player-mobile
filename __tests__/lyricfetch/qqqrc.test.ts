import qqLrcFetch from "../../src/utils/lrcfetch/qqqrc";
test("qq lrc", async () => {
  const lrcOptions = await qqLrcFetch.getLrcOptions("故事");
  expect(lrcOptions[0].lrc).not.toBeUndefined();

  await new Promise((resolve) => setTimeout(resolve, 1000));

  const lrcContent = await qqLrcFetch.getLyric("5023727");
  expect(lrcContent.length).not.toBe(0);
}, 29999);
