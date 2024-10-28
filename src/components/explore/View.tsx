import * as React from 'react';
import { StyleSheet } from 'react-native';
import { get_home, Home } from 'libmuse';

import { useNoxSetting } from '@stores/useApp';
import BiliExplore from './bilibili/View';
import useBiliExplore from './bilibili/useBiliExplore';
import YTMExplore from './ytmusic/View';
import SiteSelector from '../login/SiteSelector';
import { Site } from '../login/enum';

const TestComponent = () => {
  React.useEffect(() => {
    get_home().then(console.log);
  });
  return <></>;
};

const LoginComponent = (p: { loginSite: Site }) => {
  const biliExplore = useBiliExplore();
  return <BiliExplore useBiliExplore={biliExplore} />;
};

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <SiteSelector
      containerStyle={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
      iconSize={30}
      iconTabStyle={styles.iconTab}
      LoginComponent={LoginComponent}
    />
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconTab: {
    paddingTop: 5,
    flexDirection: 'row',
  },
});
