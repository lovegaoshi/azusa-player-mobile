import { ReOperationType } from '@enums/Utils';
import { SearchRegex } from '@enums/Playlist';

const operation2RegExtractor = (operation: NoxRegExt.Operation) => {
  const regExps = operation[1]?.map(val => new RegExp(val));
  switch (operation[0]) {
    case ReOperationType.ExtractWith:
      return (val: string) => extractWith(val, regExps);
    case ReOperationType.ExtractParenthesis:
      return (val: string) => extractParenthesis(val);
    default:
      return (val: string) => val;
  }
};

const operations2RegExtractor = (operations: NoxRegExt.Operation[]) => {
  const extractors = operations.map(operation2RegExtractor);
  return (val: string) => extractors.reduce((acc, curr) => curr(acc), val);
};

export const LoadJSONRegExtractors = (json: NoxRegExt.JSONExtractor[]) => {
  const extractors: [string[], (val: string) => string][] = json.map(val => [
    val.uploaders,
    operations2RegExtractor(val.operations),
  ]);
  return (songName: string, uploader: string | number = 0) => {
    uploader = String(uploader);
    for (const [uploaderList, extractor] of extractors) {
      if (uploaderList.includes(uploader)) {
        return extractSongName(extractor(songName));
      }
    }
    return extractSongName(songName);
  };
};

/**
 * use regex to extract songnames from a string. default to whatever in 《》
 */
export const extractSongName = (name: string) => {
  const nameReg = /《([^《》]*)》/; // For single-list BVID, we need to extract name from title
  const res = nameReg.exec(name);
  return res ? res[1] : name; // Remove the brackets

  // var nameReg = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/ // Check if name is just one string, no special chars
  // if(!nameReg.test(name))
};

/**
 * truncate the first left parenthesis and return the leftover string.
 */
export const extractParenthesis = (filename: string) => {
  return extractWith(filename, [/(.+)[（(].+/]);
};

/**
 * return the first matched value of a string against an array of regex.
 * if nothing matches, the original string is returned.
 */
export const extractWith = (filename: string, reExpressions: RegExp[] = []) => {
  for (const regex of reExpressions) {
    const extracted = regex.exec(filename);
    if (extracted?.[1]) {
      return extracted[1];
    }
  }
  return filename;
};

export const getName = (song: NoxMedia.Song, parsed = false) => {
  if (parsed) {
    return song.parsedName ? song.parsedName : song.name;
  }
  return song.name;
};

interface ReExtract {
  regex: RegExp;
  process: (val: RegExpExecArray, rows: NoxMedia.Song[]) => NoxMedia.Song[];
}

const reExtractionsDefault: ReExtract[] = [
  {
    regex: SearchRegex.absoluteMatch.regex,
    process: (val: RegExpExecArray, rows: NoxMedia.Song[]) =>
      rows.filter(row => row.parsedName === val[1]),
  },
  {
    regex: SearchRegex.artistMatch.regex,
    process: (val: RegExpExecArray, rows: NoxMedia.Song[]) =>
      rows.filter(row => row.singer.includes(val[1])),
  },
  {
    regex: SearchRegex.albumMatch.regex,
    process: (val: RegExpExecArray, rows: NoxMedia.Song[]) =>
      rows.filter(row => row.album?.includes(val[1])),
  },
  {
    regex: SearchRegex.durationLessMatch.regex,
    process: (val: RegExpExecArray, rows: NoxMedia.Song[]) =>
      rows.filter(row => row.duration < Number(val[1])),
  },
  {
    regex: SearchRegex.durationMoreMatch.regex,
    process: (val: RegExpExecArray, rows: NoxMedia.Song[]) =>
      rows.filter(row => row.duration > Number(val[1])),
  },
];

interface ReParseSearchProps {
  searchStr: string;
  rows: NoxMedia.Song[];
  defaultExtract?: (
    rows: NoxMedia.Song[],
    searchstr: string
  ) => NoxMedia.Song[];
  extraReExtract?: ReExtract[];
}
export const reParseSearch = ({
  searchStr,
  rows,
  defaultExtract = (rows: NoxMedia.Song[], searchstr: string) =>
    rows.filter(
      row =>
        row.name.toLowerCase().includes(searchstr.toLowerCase()) ||
        row.singer.includes(searchstr) ||
        row.album?.includes(searchstr)
    ),
  extraReExtract = [],
}: ReParseSearchProps) => {
  const reExtractions = [...reExtractionsDefault, ...extraReExtract];
  let extractedRows: NoxUtils.Nullable<NoxMedia.Song[]> = null;
  for (const searchSubStr of searchStr.split('|')) {
    for (const reExtraction of reExtractions) {
      const extracted = reExtraction.regex.exec(searchSubStr);
      if (extracted !== null) {
        extractedRows = reExtraction.process(extracted, rows);
        break;
      }
    }
  }
  return extractedRows ?? defaultExtract(rows, searchStr);
};
