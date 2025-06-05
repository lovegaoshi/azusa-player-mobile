import { PageHeader } from 'youtubei.js/dist/src/parser/nodes';

import { ytwebClient } from '@utils/mediafetch/ytbi';
import { ArtistFetch } from './biliartist';
import {
  fetchYtbiChannelVideos,
  fetchYtbiChannelPlaylists,
} from '../mediafetch/ytbChannel.ytbi';

export default async (channelID: string): Promise<ArtistFetch> => {
  const yt = await ytwebClient();
  const channel = await yt.getChannel(channelID);
  const channelHeader = channel.header as PageHeader;
  const profilePicURL = channelHeader?.content?.banner?.image?.[0]?.url ?? '';
  const artistName = channelHeader?.content?.title?.text?.text ?? '';
  const aboutString =
    channelHeader?.content?.description?.description?.text ?? '';
  const subscribers = (
    channelHeader?.content?.metadata?.metadata_rows?.[1]?.metadata_parts?.[0]
      .text?.text ?? ''
  ).split(' ')[0];
  return {
    profilePicURL,
    artistName,
    aboutString,
    subscribers,
    ProfilePlaySongs: await fetchYtbiChannelVideos({
      channelID,
      totalLimit: 200,
    }),
    topSongs: [],
    albums: [{ data: await fetchYtbiChannelPlaylists(channelID) }],
  };
};
