import * as React from 'react';
import { StyleSheet } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import useBiliExplore from './bilibili/useBiliExplore';
import useYTMExplore from './ytmusic/useYTMExplore';
import BiliExplore from './bilibili/View';
import YTMExplore from './ytmusic/View';
import SiteSelector from '../login/SiteSelector';
import { Site } from '@enums/Network';
import { useAPM } from '@stores/usePersistStore';

const LoginComponent = ({ loginSite }: { loginSite: Site }) => {
  const biliExplore = useBiliExplore();
  const ytmExplore = useYTMExplore();
  switch (loginSite) {
    case Site.YTM:
      return <YTMExplore useYTMExplore={ytmExplore} />;
    default:
      return <BiliExplore useBiliExplore={biliExplore} />;
  }
};

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { explorePage, setExplorePage } = useAPM();

  return (
    <SiteSelector
      containerStyle={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
      iconSize={30}
      iconTabStyle={styles.iconTab}
      LoginComponent={LoginComponent}
      defaultSite={explorePage}
      onSiteChange={setExplorePage}
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
