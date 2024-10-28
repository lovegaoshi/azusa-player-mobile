import { StyleSheet, View } from 'react-native';
import { useState } from 'react';

import Bilibili from './bilibili/Bilibili';
import { IconButton } from 'react-native-paper';
import Icons from '../playlist/BiliSearch/Icons';
import YTM from './google/YTM';

enum Site {
  Bilibili = 'bilibili',
  YTM = 'ytm',
}

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
  return (
    <View style={styles.container}>
      <View style={styles.iconTab}>
        <IconButton
          icon={() => Icons.BILIBILI(IconSize)}
          size={IconSize}
          onPress={() => setLoginSite(Site.Bilibili)}
        />
        <IconButton
          icon={() => Icons.YOUTUBEM(IconSize)}
          size={IconSize}
          onPress={() => setLoginSite(Site.YTM)}
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
    flexDirection: 'row',
    justifyContent: 'center',
  },
});
