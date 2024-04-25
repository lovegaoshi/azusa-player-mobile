import { get_channel } from 'libmuse';
import { Innertube } from 'youtubei.js';

import { regexFetchProps } from './generic';
import { fetchInnerTunePlaylist } from './ytbplaylist';
import { fetchAudioInfo } from './ytbvideo';
import bfetch from '@utils/BiliFetch';

const resolveYTChannelPlaylistId = async (channelUsername: string) => {
  const res = await bfetch(`https://www.youtube.com/c/${channelUsername}`);
  const text = await res.text();
  return /meta property="og:url" content="https:\/\/www.youtube.com\/channel\/(.+)"><meta property="og\:image" content="h/.exec(
    text
  )?.[1];
};

export const fetchYTIChannel = async (channelName: string) => {
  const channelId = await resolveYTChannelPlaylistId(channelName);
  if (!channelId) return { songList: [] };
  const yt = await Innertube.create();
  console.log(await (await yt.getChannel(channelId)).getVideos());
};

export const fetchInnerTuneChannel = async (
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
  const results = await fetchInnerTunePlaylist(
    // fetchYTPlaylist(
    reExtracted[1],
    // progressEmitter,
    favList
  );
  return { songList: results.filter(val => val !== undefined) };
};

export default {
  regexSearchMatch: /youtu.*list=([^&]+)/,
  regexFetch,
};
