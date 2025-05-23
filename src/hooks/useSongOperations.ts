import { useNoxSetting } from '@stores/useApp';
import getRadioUrl from '@utils/mediafetch/radiofetch';

const useSongOperations = () => {
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText,
  );

  const startRadio = (song: NoxMedia.Song) => {
    const url = getRadioUrl(song);
    if (url) {
      setExternalSearchText(url);
    }
  };

  return { startRadio };
};

export default useSongOperations;
