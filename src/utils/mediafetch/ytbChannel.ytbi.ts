import { Channel, Video } from 'youtubei.js/dist/src/parser/nodes';

import { ytClientWeb } from '@utils/mediafetch/ytbi';
import { ytbiVideoToNoxSong } from './ytbSearch.ytbi';

const searchYtbChannel = async (channel: string) => {
  const yt = await ytClientWeb;
  const res = await yt.search(channel, { type: 'channel' });
  const channels = res.results as unknown as Channel[];
  return channels[0].id;
};

const fetchYtbiChannelVideos = async (
  channelID: string,
  favList: string[] = [],
) => {
  const yt = await ytClientWeb;
  const channel = await yt.getChannel(channelID);
  const videos = (await channel.getVideos()).videos as unknown as Video[];
  return videos
    .filter(v => !favList.includes(v.id))
    .map(v => ytbiVideoToNoxSong(v));
};

const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const ytbChannel = await searchYtbChannel(reExtracted[1]);
  return { songList: await fetchYtbiChannelVideos(ytbChannel) };
};
export default {
  // https://www.youtube.com/c/MioriCelesta
  regexSearchMatch: /youtube\.com\/c\/([^&/]+)/,
  regexFetch,
};
