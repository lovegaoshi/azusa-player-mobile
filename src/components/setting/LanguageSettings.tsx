import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import GenericSelectDialog from '../dialogs/GenericSelectDialog';
import useRenderSettingItem from './useRenderSetting';
import { useNoxSetting } from '../../hooks/useSetting';

interface Props {
  icon: string;
}

const availableLanguages = ['zh_CN_#Hans', 'en'];

const availableLanguagesMap: { [key: string]: string } = {
  'zh_CN_#Hans': '简体中文',
  en: 'English',
};

export default ({ icon }: Props) => {
  const { t, i18n } = useTranslation();
  const [visible, setVisible] = React.useState(false);
  const { renderListItem } = useRenderSettingItem();
  const language = useNoxSetting(state => state.playerSetting).language;
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);

  const onSubmit = (val: number) => {
    setVisible(false);
    const toLang = availableLanguages[val];
    setPlayerSetting({ language: toLang });
    i18n.changeLanguage(toLang);
  };
  return (
    <View>
      {renderListItem(
        icon,
        'LanguageOptions',
        () => setVisible(true),
        'Settings'
      )}
      <GenericSelectDialog
        visible={visible}
        options={availableLanguages}
        title={String(t('Settings.LanguageOptionsTitle'))}
        renderOptionTitle={(val: string) => availableLanguagesMap[val]}
        onClose={() => setVisible(false)}
        onSubmit={onSubmit}
        defaultIndex={availableLanguages.indexOf(language || 'en')}
      ></GenericSelectDialog>
    </View>
  );
};
