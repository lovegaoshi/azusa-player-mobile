import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import { Source } from '@enums/MediaFetch';

const useSongOperations = () => {
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText
  );
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);

  const startRadio = (song: NoxMedia.Song) => {
    switch (song.source) {
      case Source.ytbvideo:
        setExternalSearchText(`youtu.be/list=RD${song.bvid}`);
        break;
      case Source.bilivideo:
        setExternalSearchText(`bilibili.com/video/similarvideo/${song.bvid}`);
      default:
        logger.warn(
          `[startRadio] ${song.bvid} deos not have a start radio handle.`
        );
    }
    setSongMenuVisible(false);
  };

  const radioAvailable = (song?: NoxMedia.Song) =>
    [Source.ytbvideo, Source.bilivideo].includes(song?.source as Source);

  return { startRadio, radioAvailable };
};

export default useSongOperations;
