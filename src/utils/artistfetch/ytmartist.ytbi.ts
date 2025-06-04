import { ytmClient } from '@utils/mediafetch/ytbi';
import {
  MusicCarouselShelf,
  MusicImmersiveHeader,
  MusicShelf,
  MusicTwoRowItem,
} from 'youtubei.js/dist/src/parser/nodes';

import { ArtistFetch } from './biliartist';
import { fetchPlaylist } from '../mediafetch/ytbPlaylist.ytbi';
import logger from '../Logger';
import { parseContent } from '@stores/explore/ytmHome.ytbi';

export default async (channelID: string): Promise<ArtistFetch> => {
  logger.debug(`[YTMArtist] resolving ${channelID}`);
  const yt = await ytmClient();
  const channel = await yt.music.getArtist(channelID);
  const channelHeader = channel.header as MusicImmersiveHeader;
  if (channel.sections.length === 0) {
    throw new Error(`[ytmArtist] channel ${channelID} is empty`);
  }
  const musicShelf = channel.sections[0] as MusicShelf;
  const carousels = channel.sections.filter(
    s => s.type === 'MusicCarouselShelf',
  ) as MusicCarouselShelf[];
  const profilePicURL = channelHeader?.thumbnail?.contents?.[0]?.url ?? '';
  const artistName = channelHeader?.title?.text ?? '';
  const aboutString = channelHeader?.description?.text ?? '';
  console.log('ytm section', carousels);
  return {
    profilePicURL,
    artistName,
    aboutString,
    subscribers: '',
    ProfilePlaySongs: [],
    topSongs: await fetchPlaylist(musicShelf.title.endpoint?.payload?.browseId),
    albums: carousels.map(c => {
      const name = c.header?.title.text ?? '';
      return {
        data: c.contents
          .filter(i => i.type === 'MusicTwoRowItem')
          // @ts-expect-error force (safe) type casting
          .map((musicTwoRowItem: MusicTwoRowItem) => {
            const cover = musicTwoRowItem.thumbnail?.[0]?.url ?? '';
            const name = musicTwoRowItem.title.text ?? '';
            const singer = musicTwoRowItem.year ?? '';
            const parsedContent = parseContent(musicTwoRowItem);
            return {
              cover,
              name,
              singer,
              getPlaylist: parsedContent?.getPlaylist ?? dummyFetch,
            };
          }),
        name,
      };
    }),
    playURL: `https://music.youtube.com/channel/${channelID}`,
    shareURL: `https://music.youtube.com/channel/${channelID}`,
  };
};

const dummyFetch = async () => ({ songs: [] });
