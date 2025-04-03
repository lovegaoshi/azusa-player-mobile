import {
  get_home,
  Home,
  Mood,
  ParsedPlaylist,
  ParsedAlbum,
  FlatSong,
  ParsedVideo,
  RelatedArtist,
} from 'libmuse';
import { create } from 'zustand';
import last from 'lodash/last';

import { fetchYtmPlaylist } from '@utils/mediafetch/ytbPlaylist.muse';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';

interface YTMExplore {
  homedata?: Home;
  moods: Mood[];
  continuation?: Home['continuation'];
  refreshHome: (params?: string) => Promise<Home>;
  loading: boolean;
  initialize: () => Promise<void>;
}

export const YTArtistTransform = (v: RelatedArtist[]) =>
  v.map(i => ({
    cover: last(i.thumbnails)!.url,
    name: i?.name,
    singer: i.subscribers ?? '',
    getPlaylist: async () => {
      return {
        songs: await fetchYtmPlaylist(i.radioId ?? i.shuffleId ?? i.browseId),
      };
    },
  }));

export const YTPlaylistTransform = (v: ParsedPlaylist[]) =>
  v.map(i => ({
    cover: last(i.thumbnails)!.url,
    name: i?.title,
    singer: i.description!,
    getPlaylist: async () => {
      return { songs: await fetchYtmPlaylist(i?.playlistId) };
    },
  }));

export const YTAlbumTransform = (v: ParsedAlbum[]) =>
  v.map(i => ({
    cover: last(i.thumbnails)!.url,
    name: i.title,
    singer: i.album_type!,
    getPlaylist: async () => ({
      songs: await fetchYtmPlaylist(i.audioPlaylistId),
    }),
  }));

export const YTMFlatSongTransform = (v: FlatSong[]) =>
  v.map(i =>
    SongTS({
      cid: `${Source.ytbvideo}-${i.videoId}`,
      bvid: i.videoId!,
      name: i.title,
      nameRaw: i.title,
      singer: i.artists?.[0].name ?? '',
      singerId: i.artists?.[0].id ?? '',
      cover: last(i.thumbnails)!.url,
      lyric: '',
      page: 1,
      duration: 0,
      album: i.album?.name ?? i.title,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  );

export const YTMInlineVideoTransform = (v: ParsedVideo[]) =>
  v.map(i =>
    SongTS({
      cid: `${Source.ytbvideo}-${i.videoId}`,
      bvid: i.videoId!,
      name: i.title,
      nameRaw: i.title,
      singer: i.artists?.[0].name ?? '',
      singerId: i.artists?.[0].id ?? '',
      cover: last(i.thumbnails)!.url,
      lyric: '',
      page: 1,
      duration: 0,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  );

export const useYTMExplore = create<YTMExplore>((set, get) => ({
  moods: [],
  loading: true,
  initialize: async () => {
    const { refreshHome, loading } = get();
    if (!loading) {
      return;
    }
    const homedata = await refreshHome();
    set({
      homedata,
      moods: homedata.moods,
      continuation: homedata.continuation,
      loading: false,
    });
  },
  refreshHome: async (params?: string) => {
    const homedata = await get_home({ params });
    set({ homedata, continuation: homedata.continuation });
    return homedata;
  },
}));

export default useYTMExplore;
