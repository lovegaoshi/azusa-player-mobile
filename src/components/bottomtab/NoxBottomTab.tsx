import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { getDrawerStatusFromState } from '@react-navigation/drawer';

import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import useNoxMobile from '@stores/useMobile';
import { BottomTabRouteIcons as RouteIcons } from '@enums/BottomTab';
import { useIsLandscape } from '@hooks/useOrientation';
import { isIOS } from '@utils/RNUtils';
import useNavigation from '@hooks/useNavigation';

interface IconProps {
  icon: string;
  onPress: () => void;
}
const BottomIconButton = ({ icon, onPress }: IconProps) => {
  return (
    <IconButton
      mode={icon.includes('outline') ? undefined : 'contained'}
      icon={icon}
      style={styles.iconButton}
      size={40}
      onPress={onPress}
    />
  );
};

const NoxAndroidBottomTab = ({ navigation }: NoxComponent.NavigationProps2) => {
  const navigationG = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const gestureMode = useNoxSetting(state => state.gestureMode);
  const route = useNoxMobile(state => state.bottomTabRoute);
  const toggleDrawer = useNoxMobile(state => state.toggleBottomTabDrawer);
  const isLandscape = useIsLandscape();

  const isDrawerOpen = () =>
    navigation === undefined
      ? false
      : getDrawerStatusFromState(navigation.getState()) === 'open';

  const onDrawerPress = () => {
    if (navigation === undefined) return;
    toggleDrawer();
    if (isDrawerOpen()) {
      navigation.closeDrawer();
      return;
    }
    navigation.openDrawer();
  };

  const renderIcon = (icon: RouteIcons) =>
    route === icon ? icon : `${icon}-outline`;

  if (!gestureMode) {
    return <></>;
  }
  return (
    <View
      style={{
        backgroundColor:
          playerStyle.colors.elevation?.level5 ?? playerStyle.colors.background,
      }}
    >
      <View style={[styles.panel, isLandscape ? { paddingBottom: 0 } : {}]}>
        <BottomIconButton
          icon={renderIcon(RouteIcons.playlist)}
          onPress={onDrawerPress}
        />
        <BottomIconButton
          icon={renderIcon(RouteIcons.music)}
          onPress={() => navigationG.navigate({ route: NoxRoutes.PlayerHome })}
        />
        <BottomIconButton
          icon={renderIcon(RouteIcons.explore)}
          onPress={() => navigationG.navigate({ route: NoxRoutes.Explore })}
        />
        <BottomIconButton
          icon={renderIcon(RouteIcons.setting)}
          onPress={() => navigationG.navigate({ route: NoxRoutes.Settings })}
        />
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
    paddingBottom: isIOS ? 20 : 0,
  },
  iconButton: {
    flex: 1,
    borderRadius: 30,
    marginVertical: 3,
  },
});

export default NoxAndroidBottomTab;
