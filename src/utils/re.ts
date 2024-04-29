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
 * @param {string} name
 * @returns parsed songname.
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
 * @param {string} filename
 * @returns  the extracted string
 */
export const extractParenthesis = (filename: string) => {
  return extractWith(filename, [/(.+)[（(].+/]);
};

/**
 * return the first matched value of a string against an array of regex.
 * if nothing matches, the original string is returned.
 * @param {string} filename
 * @param {Array} reExpressions
 * @returns the extracted string
 */
export const extractWith = (
  filename: string,
  reExpressions: Array<RegExp> = []
) => {
  for (const regex of reExpressions) {
    const extracted = regex.exec(filename);
    if (extracted !== null && extracted[1]) {
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

interface reExtract {
  regex: RegExp;
  process: (
    val: RegExpExecArray,
    someRows: Array<NoxMedia.Song>
  ) => NoxMedia.Song[];
}

const reExtractionsDefault: reExtract[] = [
  {
    regex: SearchRegex.absoluteMatch.regex,
    process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
      someRows.filter(row => row.parsedName === val[1]),
  },
  {
    regex: SearchRegex.artistMatch.regex,
    process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
      someRows.filter(row => row.singer.includes(val[1])),
  },
  {
    regex: SearchRegex.albumMatch.regex,
    process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
      someRows.filter(row => row.album?.includes(val[1])),
  },
  {
    regex: SearchRegex.durationLessMatch.regex,
    process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
      someRows.filter(row => row.duration < Number(val[1])),
  },
  {
    regex: SearchRegex.durationMoreMatch.regex,
    process: (val: RegExpExecArray, someRows: Array<NoxMedia.Song>) =>
      someRows.filter(row => row.duration > Number(val[1])),
  },
];

interface reParseSearchProps {
  searchStr: string;
  rows: Array<NoxMedia.Song>;
  defaultExtract?: (
    someRows: Array<NoxMedia.Song>,
    searchstr: string
  ) => NoxMedia.Song[];
  extraReExtract?: reExtract[];
}
export const reParseSearch = ({
  searchStr,
  rows,
  defaultExtract = (someRows: Array<NoxMedia.Song>, searchstr: string) =>
    someRows.filter(
      row =>
        row.name.toLowerCase().includes(searchstr.toLowerCase()) ||
        row.singer.includes(searchstr) ||
        row.album?.includes(searchstr)
    ),
  extraReExtract = [],
}: reParseSearchProps) => {
  const reExtractions = [...reExtractionsDefault, ...extraReExtract];
  let defaultExtraction = true;
  for (const searchSubStr of searchStr.split('|')) {
    for (const reExtraction of reExtractions) {
      const extracted = reExtraction.regex.exec(searchSubStr);
      if (extracted !== null) {
        rows = reExtraction.process(extracted, rows);
        defaultExtraction = false;
        break;
      }
    }
  }
  // if none matches, treat as a generic search, check if any field contains the search string
  if (defaultExtraction) {
    rows = defaultExtract(rows, searchStr);
  }
  return rows;
};
