import React from 'react';
import { StyleSheet, View, Platform } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { getDrawerStatusFromState } from '@react-navigation/drawer';

import { NoxRoutes } from '@enums/Routes';
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

enum RouteIcons {
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
    setRoute(RouteIcons.playlist);
    if (isDrawerOpen()) {
      navigation.closeDrawer();
      return;
    }
    navigation.openDrawer();
  };

  const renderIcon = (icon: RouteIcons) =>
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
            icon={renderIcon(RouteIcons.playlist)}
            onPress={onDrawerPress}
          />
          <BottomIconButton
            icon={renderIcon(RouteIcons.music)}
            onPress={() => {
              navigationGlobal.navigate(NoxRoutes.PlayerHome as never);
              setRoute(RouteIcons.music);
            }}
          />
          <BottomIconButton
            icon={renderIcon(RouteIcons.explore)}
            onPress={() => {
              navigationGlobal.navigate(NoxRoutes.Explore as never);
              setRoute(RouteIcons.explore);
            }}
          />
          <BottomIconButton
            icon={renderIcon(RouteIcons.setting)}
            onPress={() => {
              navigationGlobal.navigate(NoxRoutes.Settings as never);
              setRoute(RouteIcons.setting);
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
