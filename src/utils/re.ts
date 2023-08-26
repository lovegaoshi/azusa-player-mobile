import rejson from './rejson.json';

enum OPERATIONTYPE {
  extractWith = 1,
  extractParenthesis = 2,
}

type Operation = [OPERATIONTYPE, string[]?];
export interface JSONExtractor {
  uploaders: string[];
  operations: Operation[];
}

const operation2RegExtractor = (operation: Operation) => {
  const regExps = operation[1]?.map(val => new RegExp(val));
  switch (operation[0]) {
    case OPERATIONTYPE.extractWith:
      return (val: string) => extractWith(val, regExps);
    case OPERATIONTYPE.extractParenthesis:
      return (val: string) => extractParenthesis(val);
    default:
      return (val: string) => val;
  }
};

const operations2RegExtractor = (operations: Operation[]) => {
  const extractors = operations.map(operation2RegExtractor);
  return (val: string) => extractors.reduce((acc, curr) => curr(acc), val);
};

export const LoadJSONRegExtractors = (json: JSONExtractor[]) => {
  const extractors: [string[], (val: string) => string][] = json.map(val => [
    val.uploaders,
    operations2RegExtractor(val.operations),
  ]);
  return (songName: string, uploader: string | number = 0) => {
    uploader = String(uploader);
    for (const [uploaderList, extractor] of extractors) {
      if (uploaderList.includes(uploader)) {
        return extractor(songName);
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
  const nameReg = /《.*》/; // For single-list BVID, we need to extract name from title
  const res = nameReg.exec(name);
  if (res) {
    return res.length > 0 ? res[0].substring(1, res[0].length - 1) : '';
  } // Remove the brackets

  // var nameReg = /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/ // Check if name is just one string, no special chars
  // if(!nameReg.test(name))
  return name;
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

export const reExtractSongName = LoadJSONRegExtractors(
  rejson as JSONExtractor[]
);

export const getName = (song: NoxMedia.Song, parsed = false) => {
  if (parsed) {
    return song.parsedName ? song.parsedName : song.name;
  }
  return song.name;
};

export const parseSongName = (song: NoxMedia.Song): NoxMedia.Song => {
  return {
    ...song,
    parsedName: reExtractSongName(song.name, song.singerId),
  };
  song.parsedName = reExtractSongName(song.name, song.singerId);
};
