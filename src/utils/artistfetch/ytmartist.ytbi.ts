import { ytClientWeb } from '@utils/mediafetch/ytbi';
import {
  MusicCarouselShelf,
  MusicImmersiveHeader,
  MusicShelf,
  MusicTwoRowItem,
} from 'youtubei.js/dist/src/parser/nodes';

import { ArtistFetch } from './biliartist';
import { fetchYtbiChannelVideos } from '../mediafetch/ytbChannel.ytbi';
import { fetchYtbiPlaylist } from '../mediafetch/ytbPlaylist.ytbi';

export default async (channelID: string): Promise<ArtistFetch> => {
  const yt = await ytClientWeb;
  const channel = await yt.music.getArtist(channelID);
  const channelHeader = channel.header as MusicImmersiveHeader;
  const musicShelf = channel.sections[0] as MusicShelf;
  const carousels = channel.sections.filter(
    s => s.type === 'MusicCarouselShelf',
  ) as MusicCarouselShelf[];
  return {
    profilePicURL: channelHeader?.thumbnail?.contents?.[0]?.url ?? '',
    artistName: channelHeader?.title?.text ?? '',
    aboutString: channelHeader?.description?.text ?? '',
    subscribers: '',
    ProfilePlaySongs: await fetchYtbiChannelVideos(channelID),
    topSongs: await fetchYtbiPlaylist(
      musicShelf.title.endpoint?.payload?.browseId,
    ),
    albums: carousels.map(c => ({
      data: c.contents
        .filter(i => i.type === 'MusicTwoRowItem')
        // @ts-ignore
        .map((musicTwoRowItem: MusicTwoRowItem) => ({
          cover: musicTwoRowItem.thumbnail?.[0]?.url ?? '',
          name: musicTwoRowItem.title.text ?? '',
          singer: musicTwoRowItem.year ?? '',
          getPlaylist: async () => ({
            songs: await fetchYtbiPlaylist(
              musicTwoRowItem.thumbnail_overlay?.content?.endpoint.payload
                .playlistId,
            ),
          }),
        })),
      name: c.header?.title.text ?? '',
    })),
    playURL: `https://music.youtube.com/channel/${channelID}`,
    shareURL: `https://music.youtube.com/channel/${channelID}`,
  };
};
