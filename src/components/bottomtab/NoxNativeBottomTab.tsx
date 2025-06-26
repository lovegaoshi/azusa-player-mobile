import * as React from 'react';
import { View } from 'react-native';
import TabView, {
  SceneMap,
  useBottomTabBarHeight,
} from 'react-native-bottom-tabs';
import Icon from '@react-native-vector-icons/material-design-icons';
import { BaseRoute } from 'react-native-bottom-tabs/lib/typescript/commonjs/src/types';
import { getDrawerStatusFromState } from '@react-navigation/drawer';
import { useTranslation } from 'react-i18next';

import { NoxRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import useNoxMobile from '@stores/useMobile';
import useNavigation from '@hooks/useNavigation';
import { BottomTabRouteIcons } from '@enums/BottomTab';

const DummyScreen = ({
  setTabBarHeight,
}: {
  setTabBarHeight: (v: number) => void;
}) => {
  const tabBarHeight = useBottomTabBarHeight();

  React.useEffect(() => {
    setTabBarHeight(tabBarHeight);
  }, [tabBarHeight]);

  return <View style={{ height: 0 }}></View>;
};

const getIcon = ({
  focused,
  route,
}: {
  focused: boolean;
  route: BaseRoute;
}) => {
  switch (route.key) {
    case BottomTabRouteIcons.playlist:
      return focused
        ? Icon.getImageSourceSync('playlist-music', 24)
        : Icon.getImageSourceSync('playlist-music-outline', 24);
    case BottomTabRouteIcons.explore:
      return focused
        ? Icon.getImageSourceSync('compass', 24)
        : Icon.getImageSourceSync('compass-outline', 24);
    case BottomTabRouteIcons.setting:
      return focused
        ? Icon.getImageSourceSync('cog', 24)
        : Icon.getImageSourceSync('cog-outline', 24);
    default:
      return focused
        ? Icon.getImageSourceSync('music-note', 24)
        : Icon.getImageSourceSync('music-note-outline', 24);
  }
};

const Routes = [
  {
    key: BottomTabRouteIcons.playlist,
    title: 'tab2',
    focusedIcon: { sfSymbol: 'gear' },
  },
  {
    key: BottomTabRouteIcons.music,
    title: 'tab1',
    focusedIcon: { sfSymbol: 'music.note' },
  },
  {
    key: BottomTabRouteIcons.explore,
    title: 'tab3',
    focusedIcon: { sfSymbol: 'gear' },
  },
  {
    key: BottomTabRouteIcons.setting,
    title: 'tab4',
    focusedIcon: { sfSymbol: 'gear' },
  },
];

export default function TabViewExample({
  navigation,
}: NoxComponent.NavigationProps2) {
  const { t } = useTranslation();
  const [index, setIndex] = React.useState(1);
  const [tabBarHeight, setTabBarHeight] = React.useState(0);
  const navigationG = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const route = useNoxMobile(state => state.bottomTabRoute);

  const isDrawerOpen = () =>
    navigation === undefined
      ? false
      : getDrawerStatusFromState(navigation.getState()) === 'open';

  const onDrawerPress = () => {
    if (navigation === undefined) return;
    if (isDrawerOpen()) {
      return navigation.closeDrawer();
    }
    navigation.openDrawer();
  };

  const renderScene = SceneMap({
    [BottomTabRouteIcons.music]: () => (
      <DummyScreen setTabBarHeight={setTabBarHeight} />
    ),
  });

  const onIndexChange = (i: number) => {
    setIndex(i);
    setTimeout(() => {
      const newRoute = Routes[i].key;
      switch (newRoute) {
        case BottomTabRouteIcons.music:
          return navigationG.navigate({
            route: NoxRoutes.PlayerHome,
            params: { screen: NoxRoutes.Playlist, pop: true },
          });
        case BottomTabRouteIcons.playlist:
          return onDrawerPress();
        case BottomTabRouteIcons.explore:
          return navigationG.navigate({ route: NoxRoutes.Explore });
        case BottomTabRouteIcons.setting:
          return navigationG.navigate({ route: NoxRoutes.Settings });
        default:
          navigationG.navigate({ route: NoxRoutes.Settings });
      }
    }, 1);
  };

  React.useEffect(() => {
    setIndex(Routes.findIndex(r => r.key === route));
  }, [route]);

  return (
    <View style={{ height: tabBarHeight }}>
      <TabView
        // @ts-expect-error some typing bug
        navigationState={{ index, routes: Routes }}
        renderScene={renderScene}
        onIndexChange={onIndexChange}
        getIcon={getIcon}
        labeled
        translucent
        tabBarActiveTintColor={playerStyle.colors.primary}
        getLabelText={({ route }) => t(`BottomTab.${route.key}`)}
      />
    </View>
  );
}
