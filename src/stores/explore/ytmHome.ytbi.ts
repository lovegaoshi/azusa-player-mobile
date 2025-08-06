import { create } from 'zustand';
import last from 'lodash/last';
import { HomeFeed } from 'youtubei.js/dist/src/parser/ytmusic';
import {
  ChipCloudChip,
  ContinuationItem,
  MusicResponsiveListItem,
  MusicTwoRowItem,
} from 'youtubei.js/dist/src/parser/nodes';

import { ytwebClient } from '@utils/mediafetch/ytbi';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { logger } from '@utils/Logger';
import { fetchYtbiPlaylist } from '@utils/mediafetch/ytbPlaylist.ytbi';

interface YTMExplore {
  homedata?: HomeFeed;
  moods: ChipCloudChip[];
  activeMood: ChipCloudChip | undefined;
  setActiveMood: (v?: ChipCloudChip) => void;
  refreshHome: (params?: ChipCloudChip) => Promise<HomeFeed>;
  loading: boolean;
  initialize: () => Promise<void>;
}

export const SongTransform = (
  v: (MusicResponsiveListItem | ContinuationItem)[] = [],
) => {
  const songObjs = v.filter(
    v => v.type === 'MusicResponsiveListItem',
  ) as MusicResponsiveListItem[];
  return songObjs.map(i =>
    SongTS({
      cid: `${Source.ytbvideo}-${i.id}`,
      bvid: i.id!,
      name: i.title!,
      nameRaw: i.title,
      singer: i.artists?.[0]?.name ?? i.album?.name ?? '',
      singerId: i.artists?.[0]?.channel_id ?? i.album?.id ?? '',
      cover: i.thumbnail?.contents?.[0].url ?? '',
      lyric: '',
      page: 1,
      duration: i.duration?.seconds ?? 0,
      album: i.album?.name ?? i.title,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  );
};

export const ArtistTransform = (i: MusicTwoRowItem) => {
  return {
    cover: last(i.thumbnail)?.url ?? '',
    name: i?.title?.text ?? 'N/A',
    singer: i.subtitle?.text,
    getPlaylist: async () => {
      const ytc = await ytwebClient();
      const data = await ytc.music.getArtist(i.id!);
      const songs = await data.getAllSongs();
      // const continuationToken = songs.contents?.filter(v => v.type === 'ContinuationItem')?.[0] as ContinuationItem
      return {
        songs: SongTransform(songs?.contents),
      };
    },
  };
};

export const VideoTransform = (i: MusicTwoRowItem) => {
  return SongTS({
    cid: `${Source.ytbvideo}-${i.id}`,
    bvid: i.id!,
    name: i.title.text!,
    nameRaw: i.title.text,
    singer: i.subtitle.text ?? '',
    singerId: i.artists?.[0].channel_id ?? '',
    cover: i.thumbnail[0].url ?? '',
    lyric: '',
    page: 1,
    duration: 0,
    album: i.title.text,
    source: Source.ytbvideo,
    metadataOnLoad: true,
  });
};

export const PlaylistTransform = (
  i: MusicTwoRowItem,
  getid: (i: MusicTwoRowItem) => string = i => i.id!,
) => {
  return {
    cover: last(i.thumbnail)?.url ?? '',
    name: i?.title?.text ?? 'N/A',
    singer: i.subtitle?.text,
    getPlaylist: async () => {
      const ytc = await ytwebClient();
      let songs = await ytc.music.getPlaylist(getid(i));
      let contents =
        songs.contents ??
        ([] as (MusicResponsiveListItem | ContinuationItem)[]);
      while (songs.has_continuation) {
        songs = await songs.getContinuation();
        contents = [...contents, ...(songs.contents ?? [])];
      }
      return {
        songs: SongTransform(contents),
      };
    },
  };
};

export const parseContent = (v: MusicTwoRowItem) => {
  switch (v.item_type) {
    case 'artist':
      return ArtistTransform(v);
    case 'playlist':
      return PlaylistTransform(v);
    case 'video':
      return;
    default:
      logger.warn(
        `[ytmParseContent] did not specify ${v.item_type}! resulting to defualt parse...`,
      );
      console.debug(v);
      return {
        getPlaylist: async () => {
          return {
            // HACK: ytm doesnt resolve this for wahtever reason
            songs: await fetchYtbiPlaylist({
              playlistId:
                v.thumbnail_overlay?.content?.endpoint.payload.playlistId,
            }),
          };
        },
      };
  }
};

export const useYTMExplore = create<YTMExplore>((set, get) => ({
  moods: [],
  activeMood: undefined,
  setActiveMood: v => set({ activeMood: v }),
  loading: true,
  initialize: async () => {
    const { refreshHome, loading } = get();
    if (!loading) {
      return;
    }
    const homedata = await refreshHome();
    set({
      homedata,
      moods: homedata.header?.chips,
      loading: false,
    });
  },
  refreshHome: async (params?: ChipCloudChip) => {
    const yt = await ytwebClient();
    let homedata: HomeFeed;
    if (params) {
      const oldHomeData = get().homedata ?? (await yt.music.getHomeFeed());
      homedata = await oldHomeData?.applyFilter(params);
    } else {
      homedata = await yt.music.getHomeFeed();
    }
    set({ homedata });
    // homedata has header (which are the moods click button) and sections;
    // sections by section.contents?.[0]?.type is then further processed into YTSongRows
    // this matches ytmHome.muse's YTArtist, YTAlbum, YTPlaylist etc
    return homedata;
  },
}));

export default useYTMExplore;
