import * as React from 'react';
import { View } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import BiliExplore from './bilibili/View';
import { styles } from '../style';

enum NoxRoutes {
  bilibili = 'bilibili',
}

const exploreContent = (route: NoxRoutes) => {
  switch (route) {
    default:
      return <BiliExplore />;
  }
};

export default () => {
  const [currentRoute] = React.useState(NoxRoutes.bilibili);
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
