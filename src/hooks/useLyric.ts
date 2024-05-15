import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';

export default () => {
  const lyricMapping = useNoxSetting(state => state.lyricMapping);
  const setLyricMapping = useNoxSetting(state => state.setLyricMapping);

  const hasLrcFromLocal = (song?: NoxMedia.Song) => {
    return lyricMapping.has(song?.id || '');
  };

  const getLrcFromLocal = (song?: NoxMedia.Song) => {
    logger.log('[lrc] Loading Lrc from localStorage...');
    return lyricMapping.get(song?.id || '');
  };

  return { getLrcFromLocal, hasLrcFromLocal, setLyricMapping };
};
