import * as React from 'react';
import { View } from 'react-native';
import TabView, {
  SceneMap,
  useBottomTabBarHeight,
} from 'react-native-bottom-tabs';
import Icon from '@react-native-vector-icons/material-design-icons';
import { BaseRoute } from 'react-native-bottom-tabs/lib/typescript/commonjs/src/types';

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
    case 'drawer':
      return focused
        ? Icon.getImageSourceSync('playlist-music', 24)
        : Icon.getImageSourceSync('playlist-music-outline', 24);
    case 'explore':
      return focused
        ? Icon.getImageSourceSync('compass', 24)
        : Icon.getImageSourceSync('compass-outline', 24);
    case 'settings':
      return focused
        ? Icon.getImageSourceSync('cog', 24)
        : Icon.getImageSourceSync('cog-outline', 24);
    default:
      return focused
        ? Icon.getImageSourceSync('music-note', 24)
        : Icon.getImageSourceSync('music-note-outline', 24);
  }
};

export default function TabViewExample() {
  const [index, setIndex] = React.useState(0);
  const [tabBarHeight, setTabBarHeight] = React.useState(0);

  const renderScene = SceneMap({
    playlist: () => <DummyScreen setTabBarHeight={setTabBarHeight} />,
  });

  const [routes] = React.useState([
    {
      key: 'playlist',
      title: 'tab1',
      focusedIcon: { sfSymbol: 'house' },
    },
    {
      key: 'drawer',
      title: 'tab2',
      focusedIcon: { sfSymbol: 'gear' },
    },
    {
      key: 'explore',
      title: 'tab3',
      focusedIcon: { sfSymbol: 'gear' },
    },
    {
      key: 'settings',
      title: 'tab4',
      focusedIcon: { sfSymbol: 'gear' },
    },
  ]);

  return (
    <View style={{ height: tabBarHeight }}>
      <TabView
        // @ts-expect-error some typing bug
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        labeled
        getIcon={getIcon}
      />
    </View>
  );
}
