import bfetch, { getJson } from '@utils/BiliFetch';
import { YTSongRowCard } from '@components/explore/types';

export interface ArtistFetch {
  profilePicURL: string;
  artistName: string;
  ProfilePlaySongs: NoxMedia.Song[];
  topSongs: NoxMedia.Song[];
  albums: YTSongRowCard[];
  aboutString: string;
}

export default async (mid: string): Promise<ArtistFetch> => {
  const biliSpaceSetting = await getJson(
    bfetch(`https://space.bilibili.com/ajax/settings/getSettings?mid=${mid}`),
  );
  return {
    profilePicURL: `https://i2.hdslb.com/${biliSpaceSetting.data.toutu.s_img}`,
  };
};
