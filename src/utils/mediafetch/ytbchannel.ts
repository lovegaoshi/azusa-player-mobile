import { get_channel } from 'libmuse';
import { Innertube } from 'youtubei.js';

import { regexFetchProps } from './generic';
import { fetchAudioInfo } from './ytbvideo';
import bfetch from '@utils/BiliFetch';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';
import { timestampToSeconds } from '../Utils';

const innertune2NoxSong = (v: any, channel?: any) =>
  SongTS({
    cid: `${Source.ytbvideo}-${v.id}`,
    bvid: v.id,
    name: v.title.text,
    nameRaw: v.title.text,
    singer: channel?.metadata?.title || v.author.name,
    singerId: channel?.metadata?.url || v.author.id,
    cover: v.thumbnails[0].url,
    lyric: '',
    page: 1,
    duration: timestampToSeconds(
      v.thumbnail_overlays.filter(
        (overlay: any) => overlay.type === 'ThumbnailOverlayTimeStatus'
      )[0]?.text
    ),
    album: v.title.text,
    source: Source.ytbvideo,
    metadataOnLoad: true,
  });

const resolveYTChannelPlaylistId = async (channelUsername: string) => {
  const res = await bfetch(`https://www.youtube.com/c/${channelUsername}`);
  const text = await res.text();
  return /meta property="og:url" content="https:\/\/www.youtube.com\/channel\/(.+)"><meta property="og:image" content="h/.exec(
    text
  )?.[1];
};

export const fetchYTIChannel = async (
  channelName: string,
  favList: string[] = []
) => {
  const channelId = await resolveYTChannelPlaylistId(channelName);
  if (!channelId) return [];
  const yt = await Innertube.create();
  const channel = await yt.getChannel(channelId);
  const videos = (await channel.getVideos()).videos.filter(
    v => v.type === 'Video'
  );
  return videos
    .map(v => innertune2NoxSong(v, channel))
    .filter(v => !favList.includes(v.bvid));
};

export const fetchMuseChannel = async (
  channelName: string
): Promise<NoxNetwork.NoxRegexFetch> => {
  let songList: NoxMedia.Song[] = [];
  const channelId = await resolveYTChannelPlaylistId(channelName);
  if (!channelId) return { songList };
  const channelResults = await get_channel(channelId);
  const channelVideos = channelResults.videos?.results.map(v => v.videoId);
  if (!channelVideos) return { songList };
  songList = (
    await Promise.all(channelVideos.map(v => fetchAudioInfo(v)))
  ).flat();
  return {
    songList,
  };
};

const regexFetch = async ({
  reExtracted,
  favList = [],
}: regexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const songList = await fetchYTIChannel(
    // fetchYTPlaylist(
    reExtracted[1],
    // progressEmitter,
    favList
  );
  return { songList };
};

export default {
  // https://www.youtube.com/c/MioriCelesta
  regexSearchMatch: /youtube\.com\/c\/([^&/]+)/,
  regexFetch,
};
