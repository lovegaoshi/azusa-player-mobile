import * as React from 'react';
import { View } from 'react-native';
import TabView, {
  SceneMap,
  useBottomTabBarHeight,
} from 'react-native-bottom-tabs';

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

export default function TabViewExample() {
  const [index, setIndex] = React.useState(0);
  const [tabBarHeight, setTabBarHeight] = React.useState(0);

  const renderScene = SceneMap({
    home: () => <DummyScreen setTabBarHeight={setTabBarHeight} />,
  });

  const [routes] = React.useState([
    {
      key: 'home',
      title: 'tab1',
      focusedIcon: { sfSymbol: 'house' },
    },
    {
      key: 'settings',
      title: 'tab2',
      focusedIcon: { sfSymbol: 'gear' },
    },
    {
      key: 'tab13',
      title: 'tab3',
      focusedIcon: { sfSymbol: 'gear' },
    },
    {
      key: 'tab14',
      title: 'tab4',
      focusedIcon: { sfSymbol: 'gear' },
    },
  ]);

  return (
    <View style={{ height: tabBarHeight }}>
      <TabView
        navigationState={{ index, routes }}
        renderScene={renderScene}
        onIndexChange={setIndex}
        labeled
      />
    </View>
  );
}
