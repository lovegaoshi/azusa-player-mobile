import * as React from 'react';
import { useTranslation } from 'react-i18next';
import TrackPlayer from 'react-native-track-player';

import Dialog from '../../dialogs/GenericSelectDialog';
import SettingListItem from '../helpers/SettingListItem';
import useNoxSetting from '@stores/useApp';

export default function EQButton() {
  const { t } = useTranslation();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const [categories, setCategories] = React.useState<string[]>([]);
  const [visible, setVisible] = React.useState(false);

  const hideDialog = () => setVisible(false);

  const onClose = () => {
    hideDialog();
    TrackPlayer.setEqualizerPreset(playerSetting.eqPreset);
  };

  const onSubmit = async (index: number) => {
    setPlayerSetting({ eqPreset: index });
    hideDialog();
  };

  React.useEffect(() => {
    TrackPlayer.getEqualizerPresets().then(setCategories);
  }, []);

  return (
    <>
      <SettingListItem
        icon={'equalizer'}
        settingName={'EqualizerOptions'}
        onPress={() => setVisible(true)}
        settingCategory={'Equalizer'}
      />
      <Dialog
        visible={visible}
        title={t('Equalizer.EqualizerOptionsTitle')}
        options={categories}
        onSubmit={onSubmit}
        onPress={TrackPlayer.setEqualizerPreset}
        onClose={onClose}
        defaultIndex={playerSetting.eqPreset}
        renderOptionTitle={v => t(`Equalizer.${v}`)}
      />
    </>
  );
}
