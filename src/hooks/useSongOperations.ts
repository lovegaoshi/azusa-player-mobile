import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import { SOURCE } from '@enums/MediaFetch';

const useSongOperations = () => {
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText
  );
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);

  const startRadio = (song: NoxMedia.Song) => {
    switch (song.source) {
      case SOURCE.ytbvideo:
        setExternalSearchText(`youtu.be/${song.bvid}`);
        break;
      case SOURCE.bilivideo:
        setExternalSearchText(`bilibili.com/video/similarvideo/${song.bvid}`);
      default:
        logger.warn(
          `[startRadio] ${song.bvid} deos not have a start radio handle.`
        );
    }
    setSongMenuVisible(false);
  };

  const radioAvailable = (song?: NoxMedia.Song) =>
    [SOURCE.ytbvideo, SOURCE.bilivideo].includes(song?.source as SOURCE);

  return { startRadio, radioAvailable };
};

export default useSongOperations;
