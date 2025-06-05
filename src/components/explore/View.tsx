import * as React from 'react';
import { StyleSheet, View } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { useNoxSetting } from '@stores/useApp';
import BiliExplore from './Bilibili';
import YTMExplore from './YTMusic.ytbi';
import YTMChartExplore from './YTMChart';
import SiteSelector from '../login/SiteSelector';
import { Site } from '@enums/Network';
import { useAPM } from '@stores/usePersistStore';
import FlexView from '@components/commonui/FlexViewNewArch';
import AutoUnmountNavView from '../commonui/AutoUnmountNavView';

const LoginComponent = ({ loginSite }: { loginSite: Site }) => {
  switch (loginSite) {
    case Site.YTM:
      return <YTMExplore />;
    case Site.YTMChart:
      return <YTMChartExplore />;
    default:
      return <BiliExplore />;
  }
};

const Explore = () => {
  const insets = useSafeAreaInsets();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { explorePage, setExplorePage } = useAPM();

  return (
    <FlexView noFlex>
      <SiteSelector
        containerStyle={{
          backgroundColor: playerStyle.customColors.maskedBackgroundColor,
          flex: 1,
          paddingTop: insets.top,
        }}
        iconSize={30}
        iconTabStyle={styles.iconTab}
        LoginComponent={LoginComponent}
        defaultSite={explorePage}
        onSiteChange={setExplorePage}
      />
    </FlexView>
  );
};

export default () => (
  <AutoUnmountNavView>
    <Explore />
  </AutoUnmountNavView>
);

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconTab: {
    paddingTop: 5,
    flexDirection: 'row',
  },
});
