import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';

const useSongOperations = () => {
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText
  );
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);

  const startRadio = (song: NoxMedia.Song) => {
    switch (song.source) {
      case NoxEnumMediaFetch.Source.Ytbvideo:
        setExternalSearchText(`youtu.be/${song.bvid}`);
        break;
      case NoxEnumMediaFetch.Source.Bilivideo:
        setExternalSearchText(`bilibili.com/video/similarvideo/${song.bvid}`);
      default:
        logger.warn(
          `[startRadio] ${song.bvid} deos not have a start radio handle.`
        );
    }
    setSongMenuVisible(false);
  };

  const radioAvailable = (song?: NoxMedia.Song) =>
    [
      NoxEnumMediaFetch.Source.Ytbvideo,
      NoxEnumMediaFetch.Source.Bilivideo,
    ].includes(song?.source as NoxEnumMediaFetch.Source);

  return { startRadio, radioAvailable };
};

export default useSongOperations;
