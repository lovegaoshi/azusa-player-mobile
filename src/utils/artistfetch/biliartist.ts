import bfetch, { getJson } from '@utils/BiliFetch';
import { YTSongRowCard } from '@components/explore/types';
import { fetchBiliChannelList } from '../mediafetch/bilichannel';
import { getBiliUser } from '../mediafetch/biliuser';
import getBiliNotice from '../Bilibili/biliNotice';
import { getListAsYTSongRowCard } from '../mediafetch/bililist';

export interface ArtistFetch {
  profilePicURL: string;
  artistName: string;
  ProfilePlaySongs: NoxMedia.Song[];
  topSongs: NoxMedia.Song[];
  albums: YTSongRowCard[];
  aboutString: string;
  attestation?: string;
  sign: string;
}

export default async (mid: string): Promise<ArtistFetch> => {
  const biliSpaceSetting = await getJson(
    bfetch(`https://space.bilibili.com/ajax/settings/getSettings?mid=${mid}`),
  );
  const ProfilePlaySongs = await fetchBiliChannelList({
    url: `https://space.bilibili.com/${mid}/upload/video`,
    fastSearch: true,
    stopAtPage: 1,
  });
  const topSongs = await fetchBiliChannelList({
    url: `https://space.bilibili.com/${mid}/upload/video?order=click`,
    fastSearch: true,
    stopAtPage: 1,
  });
  const userInfo = await getBiliUser(mid);
  return {
    profilePicURL: `https://i2.hdslb.com/${biliSpaceSetting.data.toutu.s_img}`,
    ProfilePlaySongs,
    artistName: userInfo.name,
    attestation: userInfo.official?.title,
    sign: userInfo.sign,
    topSongs,
    aboutString: await getBiliNotice(mid),
    albums: await getListAsYTSongRowCard(mid),
  };
};
