import { YTSongRowCard } from '@components/explore/types';
import { fetchBiliChannelList } from '../mediafetch/bilichannel';
import getBiliUser from '../Bilibili/biliUserCard';
import getBiliNotice from '../Bilibili/biliNotice';
import { getListAsYTSongRowCard } from '../mediafetch/bililist';
import { nFormatter } from '../Utils';

export interface ArtistFetch {
  profilePicURL: string;
  artistName: string;
  ProfilePlaySongs: NoxMedia.Song[];
  topSongs: NoxMedia.Song[];
  albums: YTSongRowCard[];
  aboutString: string;
  attestation?: string;
  sign: string;
  subscribers: string;
}

export default async (mid: string): Promise<ArtistFetch> => {
  const ProfilePlaySongs = await fetchBiliChannelList({
    url: `https://space.bilibili.com/${mid}/upload/video`,
    fastSearch: true,
    stopAtPage: 1,
    limit: false,
  });
  const topSongs = await fetchBiliChannelList({
    url: `https://space.bilibili.com/${mid}/upload/video?order=click`,
    fastSearch: true,
    stopAtPage: 1,
    limit: false,
  });
  const userInfo = await getBiliUser(mid);
  return {
    profilePicURL: userInfo?.space?.s_img ?? '',
    ProfilePlaySongs,
    artistName: userInfo?.card.name ?? '',
    attestation: userInfo?.card.official?.title ?? '',
    sign: userInfo?.sign ?? '',
    topSongs,
    aboutString: await getBiliNotice(mid),
    albums: await getListAsYTSongRowCard(mid),
    subscribers: nFormatter(userInfo?.card?.fans ?? 0),
  };
};
