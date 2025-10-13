import { useNetInfo } from '@react-native-community/netinfo';

import { useNoxSetting } from '@stores/useApp';

export default function useDataSaver() {
  const netInfo = useNetInfo();
  const playerSetting = useNoxSetting(state => state.playerSetting);

  return {
    isDataSaving: playerSetting.dataSaver && netInfo.type === 'cellular',
  };
}
