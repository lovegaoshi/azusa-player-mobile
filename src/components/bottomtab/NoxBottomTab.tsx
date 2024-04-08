import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getDrawerStatusFromState } from '@react-navigation/drawer';

import { useNoxSetting } from '@stores/useApp';

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

const NoxAndroidBottomTab = ({ navigation }: NoxComponent.NavigationProps2) => {
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
              navigationGlobal.navigate(NoxEnumView.View.PLAYER_HOME as never);
              setRoute(Routes.music);
            }}
          />
          <BottomIconButton
            icon={renderIcon(Routes.explore)}
            onPress={() => {
              navigationGlobal.navigate(NoxEnumView.View.EXPORE as never);
              setRoute(Routes.explore);
            }}
          />
          <BottomIconButton
            icon={renderIcon(Routes.setting)}
            onPress={() => {
              navigationGlobal.navigate(NoxEnumView.View.SETTINGS as never);
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
    paddingBottom: Platform.OS === 'ios' ? 20 : 0,
  },
  iconButton: {
    flex: 1,
    borderRadius: 30,
    marginVertical: 3,
  },
});

export default NoxAndroidBottomTab;
