import React from 'react';
import { View, BackHandler, StyleSheet } from 'react-native';
import { IconButton } from 'react-native-paper';
import { useFocusEffect } from '@react-navigation/native';

import { styles } from '@components/style';
import { useNoxSetting } from '@stores/useApp';
import PlaylistInfo from '../Info/PlaylistInfo';
import PlaylistMenuButton from '../Menu/PlaylistMenuButton';
import { UsePlaylistRN } from '../usePlaylistRN';

interface Props {
  usedPlaylist: UsePlaylistRN;
}

export default function SongListHeader({ usedPlaylist }: Props) {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const {
    toggleSelectedAll,
    checking,
    setChecking,
    searching,
    setSearching,
    onBackPress,
    scrollTo,
  } = usedPlaylist;

  useFocusEffect(
    React.useCallback(() => {
      const subscription = BackHandler.addEventListener(
        'hardwareBackPress',
        onBackPress,
      );

      return () => subscription.remove();
    }, [checking, setChecking, searching, setSearching]),
  );

  const btnContainColor =
    playerStyle.colors.primaryContainer ??
    playerStyle.customColors.playlistDrawerBackgroundColor;

  return (
    <View style={[styles.topBarContainer, { top: 10 }]}>
      <PlaylistInfo
        onPressed={() => scrollTo({ viewPosition: 0.5 })}
        usePlaylist={usedPlaylist}
      />
      <View style={stylesLocal.container}>
        {checking && (
          <IconButton
            icon="select-all"
            onPress={toggleSelectedAll}
            size={25}
            //iconColor={playerStyle.colors.primary}
          />
        )}
        <IconButton
          icon="select"
          onPress={() => setChecking(val => !val)}
          size={25}
          containerColor={checking ? btnContainColor : undefined}
          //iconColor={playerStyle.colors.primary}
        />
        <IconButton
          icon="magnify"
          onPress={() => setSearching(val => !val)}
          size={25}
          mode={searching ? 'contained' : undefined}
          containerColor={searching ? btnContainColor : undefined}
          //iconColor={playerStyle.colors.primary}
        />
        <PlaylistMenuButton disabled={checking} />
      </View>
    </View>
  );
}
const stylesLocal = StyleSheet.create({
  container: {
    flexDirection: 'row',
    bottom: 5,
    justifyContent: 'flex-end',
  },
});
