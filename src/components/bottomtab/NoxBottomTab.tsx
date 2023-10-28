import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import {
  DrawerNavigationProp,
  getDrawerStatusFromState,
} from '@react-navigation/drawer';

import { ViewEnum } from '@enums/View';
import { useNoxSetting } from '@hooks/useSetting';

interface IconProps {
  icon: string;
  onPress: () => void;
}
const BottomIconButton = ({ icon, onPress }: IconProps) => {
  return (
    <IconButton
      icon={icon}
      style={styles.iconButton}
      size={40}
      onPress={onPress}
    />
  );
};

enum Routes {
  playlist = 'playlist-music',
  music = 'music-note',
  explore = 'compass',
  setting = 'cog',
}

interface Props {
  navigation?: DrawerNavigationProp<ParamListBase>;
}
const NoxAndroidBottomTab = ({ navigation }: Props) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const gestureMode = useNoxSetting(state => state.gestureMode);
  const [route, setRoute] = React.useState('music');

  const isDrawerOpen = () => {
    if (navigation === undefined) return false;
    return getDrawerStatusFromState(navigation.getState()) === 'open';
  };

  const onDrawerPress = () => {
    if (navigation === undefined) return;
    setRoute(Routes.playlist);
    if (isDrawerOpen()) {
      navigation.closeDrawer();
      return;
    }
    navigation.openDrawer();
  };

  const renderIcon = (icon: Routes) =>
    route === icon ? icon : `${icon}-outline`;

  if (gestureMode) {
    return (
      <View style={{ backgroundColor: playerStyle.colors.background }}>
        <View
          style={[
            styles.panel,
            { backgroundColor: playerStyle.colors.background },
          ]}
        >
          <BottomIconButton
            icon={renderIcon(Routes.playlist)}
            onPress={onDrawerPress}
          />
          <BottomIconButton
            icon={renderIcon(Routes.music)}
            onPress={() => {
              navigationGlobal.navigate(ViewEnum.PLAYER_HOME as never);
              setRoute(Routes.music);
            }}
          />
          <BottomIconButton
            icon={renderIcon(Routes.explore)}
            onPress={() => {
              navigationGlobal.navigate(ViewEnum.EXPORE as never);
              setRoute(Routes.explore);
            }}
          />
          <BottomIconButton
            icon={renderIcon(Routes.setting)}
            onPress={() => {
              navigationGlobal.navigate(ViewEnum.SETTINGS as never);
              setRoute(Routes.setting);
            }}
          />
        </View>
      </View>
    );
  }
  return <></>;
};

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
  },
  iconButton: {
    flex: 1,
    borderRadius: 30,
    marginVertical: 3,
  },
});

export default NoxAndroidBottomTab;
