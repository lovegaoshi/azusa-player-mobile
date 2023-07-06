/**
 * https://gist.github.com/Xmader/eb47890a901754ba452c5baa102ea907
 * convert between the new [bvid](https://www.bilibili.com/read/cv5167957/) (updated 2020-03-23) and aid
 * algorithm: https://www.zhihu.com/question/381784377/answer/1099438784
 */

// generate the modified base58 character map (similar to base58btc, but has a different order of letters)
/** n -> char */
const base58CharTable =
  'fZodR9XQDSUm21yCkr6zBqiveYah8bt4xsWpHnJE7jL5VG3guMTKNPAwcF';
/** char -> n */
const base58Map = new Map(Array.from(base58CharTable, (char, n) => [char, n]));

// see descriptions in https://www.zhihu.com/question/381784377/answer/1099438784
const xorN = 177451812;
const addN = 8728348608;
const s = [11, 10, 3, 8, 4, 6];

/**
 * convert aid to bvid
 * @param {string | number} aid
 */
const aidToBvid = aid => {
  /** convert aid to the integer "z", a large number used to calculate bvid */
  const z = (parseInt(aid) ^ xorN) + addN;

  const l = Array.from('BV1  4 1 7  ');

  s.forEach((bvidCharIndex, i) => {
    const n = Math.floor(z / 58 ** i) % 58;
    const bvidChar = base58CharTable[n];
    l[bvidCharIndex] = bvidChar;
  });

  return l.join('');
};

/**
 * convert bvid to aid
 * @param {string} bvid
 */
const bvidToAid = bvid => {
  let z = 0;

  s.forEach((bvidCharIndex, i) => {
    const bvidChar = bvid[bvidCharIndex];
    const n = base58Map.get(bvidChar);
    z += n * 58 ** i;
  });

  /** convert aid from the integer "z" */
  const aid = (z - addN) ^ xorN;

  return aid;
};

const _selfCheck = () => {
  const l = [
    ['BV17x411w7KC', 170001],
    ['BV1Q541167Qg', 455017605],
    ['BV1mK4y1C7Bz', 882584971],
  ];
  return l.every(([bvid, aid]) => {
    return bvidToAid(bvid) === aid && aidToBvid(aid) === bvid;
  });
};

if (!_selfCheck()) {
  throw new Error('self check failed');
}

module.exports = {
  aidToBvid,
  bvidToAid,
};
