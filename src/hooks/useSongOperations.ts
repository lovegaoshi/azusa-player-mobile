import { useNoxSetting } from '@stores/useApp';
import { CIDPREFIX } from '@utils/mediafetch/ytbvideo';
import { logger } from '@utils/Logger';
import { SOURCE } from '@enums/MediaFetch';

const useSongOperations = () => {
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText
  );
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);

  const startRadio = (song: NoxMedia.Song) => {
    if (song.id?.startsWith(CIDPREFIX)) {
      setExternalSearchText(`youtu.be/list=RD${song.bvid}`);
    } else {
      logger.warn(`[startRadio] ${song.bvid} is not a youtube video`);
    }
    setSongMenuVisible(false);
  };

  const radioAvailable = (song?: NoxMedia.Song) =>
    song?.source === SOURCE.ytbvideo || song?.id?.startsWith(CIDPREFIX);

  return { startRadio, radioAvailable };
};

export default useSongOperations;
