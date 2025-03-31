import { YTSongRowCard } from '@components/explore/types';
import { fetchBiliChannelList } from '../mediafetch/bilichannel';
import getBiliUser from '../Bilibili/biliUserCard';
import getBiliNotice from '../Bilibili/biliNotice';
import { getListAsYTSongRowCard } from '../mediafetch/bililist';
import { i0hdslbHTTPResolve, nFormatter } from '../Utils';

interface SongRowCard {
  name?: string;
  data: YTSongRowCard[];
}

export interface ArtistFetch {
  profilePicURL: string;
  artistName: string;
  ProfilePlaySongs: NoxMedia.Song[];
  topSongs: NoxMedia.Song[];
  albums: SongRowCard[];
  aboutString: string;
  attestation?: string;
  sign?: string;
  subscribers: string;
  shareURL?: string;
  playURL?: string;
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
  const artistName = userInfo?.card.name ?? '';
  const attestation = userInfo?.card.official?.title ?? '';
  const sign = userInfo?.sign ?? '';
  return {
    profilePicURL: i0hdslbHTTPResolve(
      ProfilePlaySongs[0].cover ?? userInfo?.space?.s_img ?? '',
    ),
    ProfilePlaySongs,
    artistName,
    attestation,
    sign,
    topSongs,
    aboutString: await getBiliNotice(mid),
    albums: [{ data: await getListAsYTSongRowCard(mid) }],
    subscribers: nFormatter(userInfo?.card?.fans ?? 0),
  };
};
