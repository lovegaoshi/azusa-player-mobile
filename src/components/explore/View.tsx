import * as React from 'react';
import { View } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import BiliExplore from './bilibili/View';
import { styles } from '../style';

enum Routes {
  bilibili = 'bilibili',
}

const exploreContent = (route: Routes) => {
  switch (route) {
    default:
      return <BiliExplore />;
  }
};

export default () => {
  const [currentRoute, setCurrentRoute] = React.useState(Routes.bilibili);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <View
      style={[
        {
          backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        },
        styles.flex,
      ]}
    >
      {exploreContent(currentRoute)}
    </View>
  );
};
