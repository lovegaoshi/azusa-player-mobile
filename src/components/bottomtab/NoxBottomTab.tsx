import React, { useEffect } from 'react';
import { NativeModules, Platform, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';

import { ViewEnum } from '@enums/View';

const { NoxAndroidAutoModule } = NativeModules;

const NoxAndroidBottomTab = () => {
  const [gestureMode, setGestureMode] = React.useState(false);
  const navigationGlobal = useNavigation();

  useEffect(() => {
    // TODO: how to use await instead of states and useEffect?
    if (Platform.OS === 'android') {
      NoxAndroidAutoModule.isGestureNavigationMode().then(setGestureMode);
    }
  }, []);

  if (gestureMode) {
    return (<View style={styles.panel}>
      <IconButton
        icon="playlist-music"
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        //@ts-ignore
        onPress={() => navigationGlobal.openDrawer()}
      />
      <IconButton icon="music" onPress={() => navigationGlobal.navigate(ViewEnum.PLAYER_HOME as never)} />
      <IconButton icon="compass" onPress={() => navigationGlobal.navigate(ViewEnum.EXPORE as never)} />
      <IconButton icon="cog" onPress={() => navigationGlobal.navigate(ViewEnum.SETTINGS as never)} />
    </View>);
  }
  return <></>;
};

const styles = StyleSheet.create({
  panel: {
    flexDirection: 'row',
  },
});

export default NoxAndroidBottomTab;
