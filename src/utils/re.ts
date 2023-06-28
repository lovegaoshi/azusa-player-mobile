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

/**
 * extract songnames with custom regex based on the uploader.
 * @param {string} filename the original video name.
 * @param {number} uploader uploader UID. note this uses song.singerId
 * @returns extracted song name.
 */
export const reExtractSongName = (
  filename: string,
  uploader: string | number = 0
) => {
  switch (String(uploader)) {
    case 'steria.vplayer.tk':
      filename = extractWith(extractParenthesis(filename), [
        /\d+-\d+-\d+-(.+)/,
        /\d+-\d+-(.+)/,
      ]);
      break;
    case '5053504': //
    case '3493085134719196': // "王胡桃w":
      // https://space.bilibili.com/5053504/channel/series
      // always {number}_{songname} by {artist}
      // 27_星の在り処 Full Ver. (Less Vocal) [BONUS TRACK] by Falcom Sound Team jdk
      // occasionally theres a parenthesis; always take whats before left parenthesis
      // im sure theres a one statement way to do this re....
      // else i do [歌切][诺莺Nox] Renegade 20221119
      filename = extractWith(extractParenthesis(extractParenthesis(filename)), [
        /\d*_(.+) \(?.*by .+/,
        /\d*_(.+)/,
        /\[.+\]\[.+\] (.+) \d+/,
        /\[.+\] (.+) \d+/,
      ]);
      break;
    case '94558176': // "冥侦探柯镇恶":
      // https://space.bilibili.com/94558176/channel/series
      // seesm to be always 【{vtuber}】《{song} （his comments）》
      // eg 【ninnikuu泥泥裤】《alice（现场LIVE纯享版~古川本辅，日）》
      filename = extractParenthesis(
        extractWith(filename, [/【.+】《(.+)》/, /《(.+)》/, /【.+】(.+)/])
      );
      break;
    case '33576761': // "-哆啦A林-":
      // https://space.bilibili.com/33576761/channel/series
      // always 【HeraKris】【stream title】{songname}
      // 【赫拉Kris】【随便唱唱】三国恋
      // in some videos, its number-song-name
      filename = extractParenthesis(
        extractWith(filename, [
          /【赫拉Kris】【.+】(.+)/,
          /【赫拉Kris.*】(.+)/,
          /\d+-(.+)-.+/,
        ])
      );
      break;
    case '170066': // "叹氣喵":
      // https://space.bilibili.com/170066/channel/series
      // 【诺莺Nox】[220212] 乒乒乓乓天下无双
      filename = extractParenthesis(
        extractWith(filename, [
          / - (.+)/,
          /【诺莺Nox】[\d+] (.+)/,
          /【诺莺Nox】(.+)/,
          /(.+) w\//,
        ])
      );
      break;
    case '355371630': // "起名字什么的真困难啊":
      // https://space.bilibili.com/355371630
      // always number.{songname}
      // 11.一番の宝物
      filename = extractWith(extractParenthesis(filename), [
        /\d+\.(.+)-\d+/,
        /\d+\.(.+)/,
      ]);
      break;
    case '3421497': // "蝉时雨☆":
      // https://space.bilibili.com/3421497/channel/series
      // always 【vtuber】{songname}
      // 【clessS×汐尔Sier】玫瑰少年
      filename = extractWith(extractParenthesis(extractParenthesis(filename)), [
        /【.+】(.+)/,
      ]);
      break;
    case '590096': // "HonmaMeiko":
      // https://space.bilibili.com/590096
      // always number {songname}
      // 11 一番の宝物
      filename = extractWith(extractParenthesis(filename), [
        /\d+ (.+)/,
        /\d+-(.+)/,
      ]);
      break;
    case '1912892773': // "海鲜DD":
      // https://space.bilibili.com/1912892773/channel/series
      // sometimes date_in_numbers{songname}; others in brackets
      // 11一番の宝物
      // 1202王菲-如愿
      filename = extractParenthesis(
        extractWith(filename, [/《(.+)》/, /\d+.+-(.+)/, /\d+(.+)/])
      );
      break;
    case '7405415': // "夜の_":
      // https://space.bilibili.com/7405415/channel/series
      // sometimes {date_in_numbers} {songname}; someimtes {index}.{somename}
      // else song name is always in brackets.
      // 9.普通朋友
      // 【03.17】只对你有感觉（半首）
      filename = extractWith(extractParenthesis(filename), [
        /《(.+)\/(.+)》/,
        /【.+】(.+)/,
        /\d+\.\d+ (.+)\//,
        /\d+\.\d+ (.+)/,
        /\d+\.(.+) - .+/,
        /\d+\.(.+)\//,
        /\d+\.(.+)/,
        /(.+)\//,
      ]);
      break;
    case '63326': // "随心":
      // https://space.bilibili.com/63326/channel/seriesdetail?sid=2701519
      // in specialized brackets.
      // 『露米Lumi_Official』『月牙湾』
      // 『露米Lumi』-『繁华』
      // 『露米Lumi』- 『一吻之间』
      // 『露米Lumi』- 『好运来』
      // 4-Part of Your World(迪士尼在逃公主）-1080P 高清-AVC
      // 1-『天下』-1080P 60帧-AVC
      filename = extractParenthesis(
        extractWith(filename, [
          /\d+-『(.+)』-\d/,
          /\d+-(.+)-\d/,
          /\d+-(.+)/,
          /『露米Lumi』-『(.+)』 *『.+』/,
          /『.+』 *- *『(.+)』/,
          /『.+』 *『(.+)』/,
          /『.+』.+『(.+)』/,
          /『.+』-(.+)-\d/,
          /『.+』-(.+)/,
          /『(.+)』/,
        ])
      );
      break;
    case '159910988': // "litmus石蕊":
      // https://space.bilibili.com/159910988/channel/collectiondetail?sid=766244
      // 凉凉【露米Lumi】
      filename = extractWith(extractParenthesis(filename), [/(.+)【.+】/]);
      break;
    case '287837': // "焱缪-猫猫兔":
      // https://space.bilibili.com/287837/channel/series
      // in specialized brackets.
      // 【折原露露 · 翻唱】乌兰巴托的夜（10.18-歌切）
      filename = extractWith(extractParenthesis(filename), [/【.+】(.+)/]);
      break;
    case '9979698': // "HACHI蜂蜜酿造厂":
      /*
            https://space.bilibili.com/9979698/channel/series
            naming template switches from time to time. below is my parsing rules in python
                if '】' in fn:
                    mutagen_loaded['title'] = fn[fn.find('】') + 1:fn.rfind(' ')]
                elif '.' in os.path.splitext(fn)[0]:
                    mutagen_loaded['title'] = fn[fn.find('.') + 1:fn.rfind(' ')]
                elif '第' in fn and '首' in fn:
                    mutagen_loaded['title'] = fn[fn.find('首') + 1:fn.rfind(' ')]
                else:
                    mutagen_loaded['title'] = fn[fn.find(' ') + 1:fn.rfind(' ')]
            annnnnd this person doesnt have a video list...
            */
      filename = extractWith(extractParenthesis(filename), [
        /【.+】(.+)/,
        /\d+\.(.+)/,
        /\d+ (.+)/,
        /第.+首(.+)/,
        /(.+) \/ HACHI/,
      ]);
      break;
    case '1304703724': // "天马的冰淇淋小推车":
      // https://www.bilibili.com/video/BV12d4y117TU/
      // seems like {MM.DD}{songname}
      filename = extractWith(extractParenthesis(filename), [/\d+\.\d+(.+)/]);
      break;
    case '8136522': // "黑修":
      // https://space.bilibili.com/8136522/channel/seriesdetail?sid=2161219
      // either in brackets or not (???)
      filename = extractWith(extractParenthesis(filename), [/【.+】(.+)/]);
      break;
    case '5085531': // "食梦莲lotus":
      // 【安妮Pomelo】1118恋爱循环
      // 阿楚姑娘0726
      filename = extractWith(extractParenthesis(filename), [
        /【.+】\d+(.+)/,
        /(\D+)\d+/,
        /【Pomelo安妮】(.+)/,
      ]);
      break;
    case '344906417': // "真心之梦":
      // https://space.bilibili.com/344906417/channel/seriesdetail?sid=2463652
      // 【咲间妮娜】射手座午后九时don't be late
      filename = extractWith(extractParenthesis(filename), [/【.+】(.+)/]);
      break;
    case '3493084803369305': // "铵溶液制造工厂":
      filename = extractWith(extractParenthesis(filename), [
        /\d+\. (.+)/,
        /【.+】(.+)\d+\.\d+/,
        /【.+】(.+)/,
      ]);
      break;
    case '7191181': // "姓单名推的DD桑":
    case '693579584': // "狐心妖面-Huxin":
    case '1902398': // "5424单推人":
    case '440555': // "楼兰我":
    case '22333688':
      // https://space.bilibili.com/7191181/channel/collectiondetail?sid=821187
      filename = extractWith(extractParenthesis(filename), [
        /【.+】(.+)\d+\.\d+/,
        /【.+】(.+)/,
      ]);
      break;
    case '1190296645': // "黑泽诺亚的五元店":
      // https://space.bilibili.com/1190296645/video
      // 【黑泽诺亚】【歌切】Hold On
      // 【黑泽诺亚】【歌切】《Starfall》
      // 【黑泽诺亚NOIR】i love you - 碧梨
      filename = extractWith(extractParenthesis(filename), [
        /【黑泽诺亚NOIR】(.+) - (.+)/,
        /【黑泽诺亚NOIR】(.+)/,
        /【黑泽诺亚】【歌切】(.+) - (.+)/,
        /【黑泽诺亚】【歌切】(.+)/,
        /【黑泽诺亚】【.+】(.+)/,
        /【黑泽诺亚】(.+)/,
      ]);
      break;
    case '284940670': // "我是你的电吉他":
      // https://space.bilibili.com/284940670/video
      filename = extractWith(extractParenthesis(filename), [/【.+】(.+)-.+/]);
      break;
    case '1035062789': // "瑞娅Rhea的魔法记录仪":
      // https://space.bilibili.com/1035062789/channel/seriesdetail?sid=576862
      filename = extractWith(extractParenthesis(filename), [
        /(.+) - /,
        /(.+) w\/ /,
        /【.+】\d+\.\d+ (.+)/,
        /【.+】(.+)/,
      ]);
      break;
    case '2509376': // "棉花mennka":
      // https://space.bilibili.com/2509376/channel/series
      filename = extractWith(extractParenthesis(filename), [
        / - (.+) \d+\.\d+/,
        / - (.+)/,
      ]);
      break;
    case '731556': // 绫音aya
      // https://space.bilibili.com/731556/video?tid=3&page=2&keyword=&order=pubdate
      filename = extractWith(extractParenthesis(filename), [
        /『(.+)』/,
        /「.+」(.+)/,
        /【.+】(.+)/,
      ]);
      break;
    case '1632389': // 一片秦槐
      filename = extractWith(extractParenthesis(filename), [
        /.+ - (.+)/,
        /.+-(.+)/,
      ]);
      break;
    case '1020055498':
      // https://www.bilibili.com/video/BV1ya411J7M3/
      // 1-你是我的布鲁-00.05.54-00.09.47
      filename = extractWith(extractParenthesis(filename), [/\d+-(.+)-.+-.+/]);
      break;
    case '1375400985': // 安可周报
      filename = extractWith(extractParenthesis(filename), [
        /『(.+)』/,
        /【安可】(.+)/,
        /【安可Anko】(.+)/,
      ]);
      break;
    case '440738032': // 安可周报
      // 【超可爱2D演绎】强风大背头，假发都吹掉了！「強風オールバック」
      filename = extractWith(extractParenthesis(filename), [/「(.+)」/]);
      break;
    case '37754047': // 咻咻满
      filename = extractWith(extractParenthesis(filename), [
        /『(.+)』/,
        /【(.+)】/,
      ]);
      break;
    case '1809378863': // 薇薇单推人
      filename = extractWith(extractParenthesis(filename), [
        /【薇Steria】.+【(.+)】/,
        /【薇Steria】(.+)/,
      ]);
      break;
    case '1023630944': // 濑田水一
      filename = extractWith(extractParenthesis(filename), [/、(.+)/]);
      break;
    case '1243266187': // 林莉奈RinaHayashi
      // 这么可爱…真是对不起✨「可愛くてごめん」甜美翻唱
      filename = extractWith(extractParenthesis(filename), [
        /「(.+)」/,
        /【.+】(.+)【.+】/,
      ]);
      break;
    case '188679': // 阿布
      extractParenthesis(
        (filename = extractWith(filename, [
          /【.+】(.+)【.+】/,
          /【.*阿布】(.+)/,
          /【(.+)】/,
        ]))
      );
      break;
    case '269345545':
      // 想起你的时候| Cover（蔡恩雨 Priscilla Abby）
      filename = extractWith(extractParenthesis(filename), [/(.+)\|/]);
      break;
    case '1468696':
      filename = extractWith(extractParenthesis(filename), [
        // 【薇Steria】0318直播歌切 万梦星
        /【薇Steria】\d+直播歌切 (.+)/,
      ]);
      break;
    case '35861291':
      filename = extractWith(extractParenthesis(filename), [
        /\d+\.\d+\.\d+-(.+)/,
      ]);
      break;
    case '1381545':
      // 【伦桑】高贵与丑-这种唱法的我.你多久没见了？还是从来没见过？来吧.高贵与丑..
      filename = extractWith(extractParenthesis(filename), [/【伦桑】(.+)-/]);
      break;
    case '36908799': // V区歌老嗨
      filename = extractWith(
        // 【薇Steria】桜色舞うころ
        // 雨后日记-单依纯

        extractParenthesis(filename),
        [/(.+)-/, /【.+】(.+)/]
      );
      break;
    case '0':
      filename = extractWith(extractParenthesis(filename), []);
      break;
    default:
  }
  // if fails, first try to extract in brackets; else return as is.
  return extractSongName(filename);
};

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
