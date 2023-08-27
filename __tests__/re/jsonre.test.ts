import rejson from '../../src/utils/rejson.json';
import { LoadJSONRegExtractors, JSONExtractor } from '../../src/utils/re';

const reExtractSongName = LoadJSONRegExtractors(rejson as JSONExtractor[]);

test('王胡桃w', () => {
  expect(
    reExtractSongName(
      '3493085134719196',
      '00_愚人曲 by Monster Siren Records & Steven Grove - WiSteria'
    )
  ).toBe('愚人曲');
});
