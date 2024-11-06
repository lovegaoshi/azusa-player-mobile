import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { useRef, useState } from 'react';
import { IconButton } from 'react-native-paper';

import Icons from '../playlist/BiliSearch/Icons';
import { Site, Sites } from '@enums/Network';
import useCollapsible from './useCollapsible';
import { Collapsible } from '@components/commonui/Collapsible';

interface Props {
  LoginComponent: (p: { loginSite: Site }) => JSX.Element;
  iconSize?: number;
  iconTabStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  onSiteChange?: (site: Site) => void;
  defaultSite?: Site;
}

export default ({
  defaultSite = Site.Bilibili,
  LoginComponent,
  iconSize = 80,
  iconTabStyle = styles.iconTab,
  containerStyle = styles.container,
  onSiteChange,
}: Props) => {
  const [loginSite, setLoginSite] = useState<Site>(defaultSite);
  const collapsed = useCollapsible(state => state.collapse);
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
  };

  const setLoginSiteAnimated = (v: Site) => {
    setLoginSite(v);
    onSiteChange?.(v);
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
    <View style={containerStyle}>
      <Collapsible collapsed={collapsed}>
        <View style={iconTabStyle}>
          <IconButton
            style={{ opacity: bilibiliOpacity }}
            icon={() => Icons.BILIBILI(iconSize)}
            size={iconSize}
            onPress={() => setLoginSiteAnimated(Site.Bilibili)}
          />
          <IconButton
            style={{ opacity: ytmOpacity }}
            icon={() => Icons.YOUTUBEM(iconSize)}
            size={iconSize}
            onPress={() => setLoginSiteAnimated(Site.YTM)}
          />
        </View>
      </Collapsible>
      <LoginComponent loginSite={loginSite} />
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
