import { fetchYtbiChannelVideos, searchYtbChannel } from './ytbChannel.ytbi';
const regexFetch = async ({
  reExtracted,
  favList = [],
}: NoxNetwork.RegexFetchProps): Promise<NoxNetwork.NoxRegexFetch> => {
  const channelID = await searchYtbChannel(reExtracted[1]);
  return {
    songList: await fetchYtbiChannelVideos({
      channelID,
      favList,
      extraChannelGet: v => v.getLiveStreams(),
    }),
  };
};
export default {
  // https://www.youtube.com/c/MioriCelesta
  regexSearchMatch: /youtube\.com\/(@[^&/]+)\/streams/,
  regexFetch,
};
