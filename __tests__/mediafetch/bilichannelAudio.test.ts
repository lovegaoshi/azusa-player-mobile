import fetcher from "../../src/utils/mediafetch/bilichannelAudio";
test("bilichannelAudio", async () => {
  const content = await fetcher.regexFetch({
    reExtracted: fetcher.regexSearchMatch.exec(
      "https://space.bilibili.com/529249/audio",
    )!,
  });
  // console.log(content);
  expect(content?.songList[0]?.id).not.toBeNull();
});
