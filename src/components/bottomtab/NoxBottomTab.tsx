import React from 'react';
import { StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { getDrawerStatusFromState } from '@react-navigation/drawer';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import useNoxMobile from '@stores/useMobile';
import { BottomTabRouteIcons as RouteIcons } from '@enums/BottomTab';
import { useIsLandscape } from '@hooks/useOrientation';
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
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
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

  return (
    <View
      style={{
        backgroundColor:
          playerStyle.colors.elevation?.level5 ?? playerStyle.colors.background,
      }}
    >
      <View
        style={[
          styles.panel,
          { paddingBottom: isLandscape ? 0 : insets.bottom },
        ]}
      >
        <BottomIconButton
          icon={renderIcon(RouteIcons.playlist)}
          onPress={onDrawerPress}
        />
        <BottomIconButton
          icon={renderIcon(RouteIcons.music)}
          onPress={() =>
            navigationG.navigate({
              route: NoxRoutes.PlayerHome,
              params: { screen: NoxRoutes.Playlist, pop: true },
            })
          }
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
  },
  iconButton: {
    flex: 1,
    borderRadius: 30,
    marginVertical: 3,
  },
});

export default NoxAndroidBottomTab;
