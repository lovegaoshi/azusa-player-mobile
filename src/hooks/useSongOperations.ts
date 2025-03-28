import { useNoxSetting } from '@stores/useApp';
import getRadioUrl from '@utils/radiofetch/fetch';

const useSongOperations = () => {
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText,
  );
  const setSongMenuVisible = useNoxSetting(state => state.setSongMenuVisible);

  const startRadio = (song: NoxMedia.Song) => {
    const url = getRadioUrl(song);
    if (url) {
      setExternalSearchText(url);
    }
    setSongMenuVisible(false);
  };

  return { startRadio };
};

export default useSongOperations;
