import rejson from "../../src/utils/rejson.json";
import { LoadJSONRegExtractors } from "../../src/utils/re";

const reExtractSongName = LoadJSONRegExtractors(rejson);

test("王胡桃w", () => {
  expect(
    reExtractSongName(
      "00_愚人曲 by Monster Siren Records & Steven Grove - WiSteria",
      "3493085134719196",
    ),
  ).toBe("愚人曲");
});
