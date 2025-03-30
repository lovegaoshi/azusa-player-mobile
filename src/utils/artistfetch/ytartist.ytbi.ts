import { ytClientWeb } from '@utils/mediafetch/ytbi';
import { PageHeader } from 'youtubei.js/dist/src/parser/nodes';

import { ArtistFetch } from './biliartist';
import {
  fetchYtbiChannelVideos,
  fetchYtbiChannelPlaylists,
} from '../mediafetch/ytbChannel.ytbi';

export default async (channelID: string): Promise<ArtistFetch> => {
  const yt = await ytClientWeb;
  const channel = await yt.getChannel(channelID);
  const channelHeader = channel.header as PageHeader;
  return {
    profilePicURL: channelHeader?.content?.banner?.image?.[0]?.url ?? '',
    artistName: channelHeader?.content?.title?.text?.text ?? '',
    aboutString: channelHeader?.content?.description?.description?.text ?? '',
    subscribers: (
      channelHeader?.content?.metadata?.metadata_rows?.[1]?.metadata_parts?.[0]
        .text?.text ?? ''
    ).split(' ')[0],
    ProfilePlaySongs: await fetchYtbiChannelVideos({
      channelID,
      totalLimit: 200,
    }),
    topSongs: [],
    albums: [{ data: await fetchYtbiChannelPlaylists(channelID) }],
  };
};
