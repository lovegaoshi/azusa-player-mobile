import {
  Video,
  Channel as SearchChannel,
  LockupView,
  CollectionThumbnailView,
  ThumbnailOverlayBadgeView,
} from 'youtubei.js/dist/src/parser/nodes';
import {
  Channel,
  ChannelListContinuation,
} from 'youtubei.js/dist/src/parser/youtube';

import { ytClientWeb } from '@utils/mediafetch/ytbi';
import { ytbiVideoToNoxSong } from './ytbSearch.ytbi';
import { fetchYtbiPlaylist } from './ytbPlaylist.ytbi';

export const searchYtbChannel = async (channel: string) => {
  const yt = await ytClientWeb;
  const res = await yt.search(channel, { type: 'channel' });
  const channels = res.results as unknown as SearchChannel[];
  return channels[0].id;
};

const getYtbSong = async (
  playlistData: Channel | ChannelListContinuation,
  songs: NoxMedia.Song[],
  favList: string[],
  totalLimit = Infinity,
): Promise<NoxMedia.Song[]> => {
  const videos = playlistData.videos as Video[];
  for (const video of videos) {
    if (!favList.includes(video.video_id)) {
      const song = ytbiVideoToNoxSong(video);
      songs.push(song);
    } else {
      return songs;
    }
  }
  if (playlistData.has_continuation && totalLimit > songs.length) {
    return getYtbSong(
      await playlistData.getContinuation(),
      songs,
      favList,
      totalLimit,
    );
  }
  return songs;
};

export const fetchYtbiChannelPlaylists = async (channelID: string) => {
  try {
    const yt = await ytClientWeb;
    const channel = await yt.getChannel(channelID);
    const playlists = (await channel.getPlaylists()).playlists as LockupView[];
    return playlists.map(v => {
      const thumbnail = v?.content_image as CollectionThumbnailView;
      const overlayBadge = thumbnail?.primary_thumbnail
        ?.overlays?.[0] as ThumbnailOverlayBadgeView;
      return {
        cover: thumbnail?.primary_thumbnail?.image?.[0]?.url ?? '',
        name: v.metadata?.title.text ?? '',
        singer: overlayBadge?.badges[0].text ?? '',
        getPlaylist: async () => ({
          songs: await fetchYtbiPlaylist(v.content_id),
        }),
      };
    });
  } catch {
    return [];
  }
};

interface FetchYtbiChannelVideos {
  channelID: string;
  favList?: string[];
  totalLimit?: number;
  extraChannelGet?: (v: Channel) => Promise<Channel>;
}
export const fetchYtbiChannelVideos = async ({
  channelID,
  favList = [],
  totalLimit = Infinity,
  extraChannelGet = async v => v,
}: FetchYtbiChannelVideos) => {
  const yt = await ytClientWeb;
  const channel = await yt.getChannel(channelID);
  const finalChannel = await extraChannelGet(channel);
  const channelvideos = await finalChannel.getVideos();
  return getYtbSong(channelvideos, [], favList, totalLimit);
};

const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const channelID = await searchYtbChannel(reExtracted[1]);
  return { songList: await fetchYtbiChannelVideos({ channelID, favList }) };
};
export default {
  // https://www.youtube.com/c/MioriCelesta
  regexSearchMatch: /youtube\.com\/c\/([^&/]+)/,
  regexSearchMatch2: /youtube\.com\/(@[^&/]+)/,
  regexFetch,
};
