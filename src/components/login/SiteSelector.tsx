import { StyleSheet, View, Animated, ViewStyle } from 'react-native';
import { useRef, useState } from 'react';
import { IconButton } from 'react-native-paper';

import { Site, Sites, SiteIcon } from '@enums/Network';
import useCollapsible from './useCollapsible';
import { Collapsible } from '@components/commonui/Collapsible';

interface Props {
  LoginComponent: (p: { loginSite: Site }) => JSX.Element;
  iconSize?: number;
  iconTabStyle?: ViewStyle;
  containerStyle?: ViewStyle;
  onSiteChange?: (site: Site) => void;
  defaultSite?: Site;
  sites?: Site[];
}

export default ({
  defaultSite = Site.Bilibili,
  LoginComponent,
  iconSize = 40,
  iconTabStyle = styles.iconTab,
  containerStyle = styles.container,
  onSiteChange,
  sites = Sites,
}: Props) => {
  const [loginSite, setLoginSite] = useState<Site>(defaultSite);
  const collapsed = useCollapsible(state => state.collapse);
  const opacityValue = (v: Site, toSite = loginSite) =>
    toSite === v ? 1 : 0.2;

  const bilibiliOpacity = useRef(
    new Animated.Value(opacityValue(Site.Bilibili)),
  ).current;
  const ytmOpacity = useRef(new Animated.Value(opacityValue(Site.YTM))).current;
  const ytmChartOpacity = useRef(
    new Animated.Value(opacityValue(Site.YTMChart)),
  ).current;

  const getAnimatedOpacityRef = (site: Site) => {
    switch (site) {
      case Site.Bilibili:
        return bilibiliOpacity;
      case Site.YTM:
        return ytmOpacity;
      case Site.YTMChart:
        return ytmChartOpacity;
    }
  };

  const setLoginSiteAnimated = (v: Site) => {
    setLoginSite(v);
    onSiteChange?.(v);
    Animated.parallel(
      sites.map(site =>
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
          {sites.map(site => (
            <IconButton
              style={{ opacity: getAnimatedOpacityRef(site) }}
              icon={SiteIcon(site, iconSize)}
              size={iconSize}
              onPress={() => setLoginSiteAnimated(site)}
            />
          ))}
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
