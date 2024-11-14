import React from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import { IconButton } from 'react-native-paper';
import Animated, {
  SharedValue,
  useAnimatedStyle,
  useDerivedValue,
} from 'react-native-reanimated';

import { useNoxSetting } from '@stores/useApp';
import RandomGIFButton from '../buttons/RandomGIF';
import { MinPlayerHeight } from './Constants';

interface Props {
  opacity: SharedValue<number>;
  collapse: () => void;
}

export default ({ opacity, collapse }: Props) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);

  const infoStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      zIndex: opacity.value > 0 ? 1 : 0,
    };
  });

  return (
    <Animated.View
      style={[
        styles.containerStyle,
        playerStyle.playerTopBarContainer,
        { position: 'absolute' },
        infoStyle,
      ]}
    >
      <View style={styles.iconButtonContainerStyle}>
        <IconButton
          icon="arrow-collapse"
          size={40}
          iconColor={playerStyle.colors.primary}
          onPress={collapse}
        />
      </View>

      <View style={styles.randomGifButtonContainerStyle}>
        <RandomGIFButton
          gifs={playerStyle.gifs}
          favList={String(currentPlayingId)}
        />
      </View>
      <View style={styles.playlistIconButtonContainerStyle}>
        <IconButton
          icon="playlist-music"
          size={40}
          iconColor={playerStyle.colors.primary}
          onPress={() => console.log('pressed')}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  iconButtonContainerStyle: {
    alignContent: 'flex-start',
  },
  randomGifButtonContainerStyle: {
    flex: 4,
    alignContent: 'center',
    alignItems: 'center',
  },
  playlistIconButtonContainerStyle: {
    alignContent: 'flex-end',
  },
  containerStyle: {
    alignItems: 'center',
  },
});
