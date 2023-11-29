import useAnalytics from '../utils/Analytics';
import { useNoxSetting } from '@stores/useApp';

export default () => {
  const { analyzePlaylist } = useAnalytics();

  return { analyzePlaylist };
};
