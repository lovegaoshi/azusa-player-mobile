import { biliSuggest } from '@utils/Bilibili/BiliOperate';
import biliavideo from './biliavideo';
import { randomChoice, regexMatchOperations } from '@utils/Utils';
import ytbvideoFetch from './ytbvideo';

const regexResolveURLs: NoxUtils.RegexMatchSuggest<NoxMedia.Song> = [
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.suggest],
  [ytbvideoFetch.regexResolveURLMatch2, ytbvideoFetch.suggest],
];
const regexResolveURLsYTM: NoxUtils.RegexMatchSuggest<NoxMedia.Song> = [
  [ytbvideoFetch.regexResolveURLMatch, ytbvideoFetch.suggestYTM],
  [ytbvideoFetch.regexResolveURLMatch2, ytbvideoFetch.suggestYTM],
];
// 130,音乐综合 29,音乐现场 59,演奏 31,翻唱 193,MV 30,VOCALOID·UTAU 194,电音 28,原创音乐
const musicTids = [130, 29, 59, 31, 193, 30, 194, 28];

interface Props {
  skipLongVideo?: boolean;
  preferYTM?: boolean;
  currentSong?: NoxMedia.Song;
}
export default async ({
  skipLongVideo = true,
  preferYTM = true,
  currentSong,
}: Props) => {
  if (!currentSong) throw new Error('[PlaySuggest] currenSong is not valid!');

  const finalRegexResolveURLs = preferYTM
    ? regexResolveURLsYTM
    : regexResolveURLs;

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const filterMW = (v: any[]) => {
    let list = v;
    if (skipLongVideo) {
      list = v.filter(song => song.duration < 600);
      if (list.length === 0) {
        list = v;
      }
    }
    return randomChoice(list);
  };

  const fallback = async () => {
    if (!currentSong.bvid.startsWith('BV')) {
      throw new Error('not a bvid; bilisuggest fails');
    }
    const biliSuggested = (await biliSuggest(currentSong.bvid)).filter(val =>
      musicTids.includes(val.tid),
    );
    return (
      await biliavideo.regexFetch({
        reExtracted: [
          '',
          filterMW(biliSuggested).aid,
          // HACK: sure sure regexpexecarray
        ] as unknown as RegExpExecArray,
      })
    ).songList[0];
  };

  return regexMatchOperations({
    song: currentSong,
    regexOperations: finalRegexResolveURLs.map(resolver => [
      resolver[0],
      (song: NoxMedia.Song) => resolver[1](song, filterMW),
    ]),
    fallback,
    regexMatching: song => song.id,
  });
};
