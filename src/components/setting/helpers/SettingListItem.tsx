import React from 'react';
import { useTranslation } from 'react-i18next';
import { StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';

import { useNoxSetting } from '@stores/useApp';
import { PaperListItem } from '@components/commonui/ScaledText';
/**
 * renders a generic clickable item.
 */
interface Props {
  icon?: string | (() => React.JSX.Element);
  settingName: string;
  onPress: () => void;
  settingCategory?: string;
  modifyDescription?: (val: string) => string;
}

const SettingListItem = ({
  icon,
  settingName,
  onPress,
  settingCategory = 'DeveloperSettings',
  modifyDescription = (val: string) => val,
}: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const getIcon = () => {
    if (typeof icon === 'string') {
      return (
        <IconButton
          iconColor={playerStyle.colors.primary}
          icon={icon}
          size={40}
        />
      );
    } else if (typeof icon === 'function') {
      return icon();
    } else {
      return <></>;
    }
  };

  return (
    <PaperListItem
      left={getIcon}
      title={t(`${settingCategory}.${settingName}Name`)}
      description={modifyDescription(
        t(`${settingCategory}.${settingName}Desc`),
      )}
      onPress={onPress}
      style={styles.listItem}
    />
  );
};

export default SettingListItem;

const styles = StyleSheet.create({
  listItem: {
    paddingVertical: 0,
  },
});
