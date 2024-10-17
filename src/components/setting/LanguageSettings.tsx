import * as React from 'react';
import { View } from 'react-native';
import { useTranslation } from 'react-i18next';

import GenericSelectDialog from '../dialogs/GenericSelectDialog';
import { SettingListItem } from './useRenderSetting';
import { useNoxSetting } from '@stores/useApp';

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
  const language = useNoxSetting(state => state.playerSetting).language;
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const setShawarmaVoice = useNoxSetting(state => state.setShawarmaVoice);

  const onSubmit = (val: number) => {
    setVisible(false);
    const toLang = availableLanguages[val];
    setPlayerSetting({ language: toLang });
    i18n.changeLanguage(toLang);
  };
  return (
    <View>
      <SettingListItem
        icon={icon}
        settingName="LanguageOptions"
        onPress={() => setVisible(true)}
        settingCategory="Settings"
      />
      <GenericSelectDialog
        visible={visible}
        options={availableLanguages}
        title={t('Settings.LanguageOptionsTitle')}
        renderOptionTitle={(val: string) => availableLanguagesMap[val]}
        onClose={() => setVisible(false)}
        onSubmit={onSubmit}
        defaultIndex={availableLanguages.indexOf(language ?? 'en')}
        onPress={(val: number) =>
          setShawarmaVoice(
            'https://www.learningcontainer.com/wp-content/uploads/2020/02/Kalimba.mp3'
          )
        }
      />
    </View>
  );
};
