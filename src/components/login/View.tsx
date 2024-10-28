import { StyleSheet, View, Animated } from 'react-native';
import { useRef, useState } from 'react';
import { IconButton } from 'react-native-paper';

import Icons from '../playlist/BiliSearch/Icons';
import Bilibili from './bilibili/Bilibili';
import YTM from './google/YTM';

enum Site {
  Bilibili = 'bilibili',
  YTM = 'ytm',
}

const Sites = [Site.Bilibili, Site.YTM];

const IconSize = 80;

const LoginPage = ({ loginSite }: { loginSite: Site }) => {
  switch (loginSite) {
    case Site.Bilibili:
      return <Bilibili />;
    case Site.YTM:
      return <YTM />;
  }
};

export default () => {
  const [loginSite, setLoginSite] = useState<Site>(Site.Bilibili);
  const opacityValue = (v: Site, toSite = loginSite) =>
    toSite === v ? 1 : 0.2;

  const bilibiliOpacity = useRef(
    new Animated.Value(opacityValue(Site.Bilibili)),
  ).current;
  const ytmOpacity = useRef(new Animated.Value(opacityValue(Site.YTM))).current;

  const getAnimatedOpacityRef = (site: Site) => {
    switch (site) {
      case Site.Bilibili:
        return bilibiliOpacity;
      case Site.YTM:
        return ytmOpacity;
    }
    return ytmOpacity;
  };

  const setLoginSiteAnimated = (v: Site) => {
    setLoginSite(v);
    Animated.parallel(
      Sites.map(site =>
        Animated.timing(getAnimatedOpacityRef(site), {
          toValue: opacityValue(site, v),
          duration: 200,
          useNativeDriver: true,
        }),
      ),
    ).start();
    setLoginSite(v);
  };

  return (
    <View style={styles.container}>
      <View style={styles.iconTab}>
        <IconButton
          style={{ opacity: bilibiliOpacity }}
          icon={() => Icons.BILIBILI(IconSize)}
          size={IconSize}
          onPress={() => setLoginSiteAnimated(Site.Bilibili)}
        />
        <IconButton
          style={{ opacity: ytmOpacity }}
          icon={() => Icons.YOUTUBEM(IconSize)}
          size={IconSize}
          onPress={() => setLoginSiteAnimated(Site.YTM)}
        />
      </View>
      <LoginPage loginSite={loginSite} />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  iconTab: {
    paddingTop: 20,
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
