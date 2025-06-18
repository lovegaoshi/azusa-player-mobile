/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import { Modal, View, StyleSheet, Button, ViewStyle } from 'react-native';
import { Lrc as Lyric, KaraokeMode } from 'react-native-lyric';
import TrackPlayer, { Track, useProgress } from 'react-native-track-player';
import { IconButton } from 'react-native-paper';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { useNoxSetting } from '@stores/useApp';
import useLyric from '@hooks/useLyricRN';
import { NativeText as Text } from '@components/commonui/ScaledText';
import LyricBottomSheet from './LyricBottomSheet';
import { NoxSheetRoutes } from '@enums/Routes';

interface LyricViewProps {
  track: Track;
  artist: string;
  height?: number;
  showUI?: boolean;
  noScrollThrottle?: boolean;
  onPress?: () => void;
  visible?: boolean;
  style?: ViewStyle;
}

export const LyricView = ({
  track,
  artist,
  height,
  showUI = true,
  noScrollThrottle = true,
  onPress = () => undefined,
  visible = true,
  style = styles.container,
}: LyricViewProps) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const { position } = useProgress(
    playerSetting.karaokeLyrics ? 50 : undefined,
  );
  const [offsetModalVisible, setOffsetModalVisible] = useState(false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const usedLyric = useLyric(track.song, artist);
  const {
    hasLrcFromLocal,
    searchAndSetCurrentLyric,
    addSubtractOffset,
    initTrackLrcLoad,
    lrc,
    lrcOptions,
    currentTimeOffset,
  } = usedLyric;

  useEffect(() => {
    if (track === undefined || track.title === '') return;
    initTrackLrcLoad();
  }, [track]);

  useEffect(() => {
    const init = async () => {
      if (await hasLrcFromLocal(track?.song)) return;
      searchAndSetCurrentLyric({});
    };
    init();
  }, [lrcOptions]);

  if (!visible) return null;

  return (
    <View
      style={style}
      onLayout={e => console.log('debug', e.nativeEvent.layout)}
    >
      <LyricBottomSheet
        showLyricOffsetModal={() => setOffsetModalVisible(true)}
        usedLyric={usedLyric}
      />
      <Lyric
        style={{ marginTop: 30, height: 500 }}
        lrc={lrc}
        currentTime={(position + currentTimeOffset) * 1000}
        lineHeight={32}
        height={height}
        noScrollThrottle={noScrollThrottle}
        onPress={onPress}
        // HACK: this is NOT any. this is LrcLine. need to fix with ts
        onLinePress={
          playerSetting.lyricTap
            ? (v: any) => TrackPlayer.seekTo(v.millisecond / 1000)
            : onPress
        }
        karaokeOnColor={
          playerStyle.colors.karaokeOn ?? playerStyle.colors.onSurface
        }
        karaokeOffColor={
          playerStyle.colors.karaokeOff ?? playerStyle.colors.onSurfaceVariant
        }
        karaokeMode={
          playerSetting.karaokeLyrics ? KaraokeMode.OnlyRealKaraoke : undefined
        }
      />
      {showUI && (
        <>
          <View style={styles.optionsButton}>
            <IconButton
              icon="more"
              onPress={() => TrueSheet.present(NoxSheetRoutes.LyricSheet)}
            />
          </View>
          <Modal
            animationType="fade"
            transparent={true}
            visible={offsetModalVisible}
            onRequestClose={() => setOffsetModalVisible(false)}
          >
            <View style={styles.offsetModalView}>
              <Button
                title="+"
                onPress={() => addSubtractOffset(true)}
                color={playerStyle.colors.primaryContainer}
              />
              <Text
                style={[
                  styles.lyricOffsetText,
                  {
                    backgroundColor: playerStyle.colors.primaryContainer,
                    color: playerStyle.colors.secondary,
                  },
                ]}
              >
                {currentTimeOffset}
              </Text>
              <Button
                title="-"
                onPress={() => addSubtractOffset(false)}
                color={playerStyle.colors.primaryContainer}
              />
              <Button
                title="X"
                onPress={() => setOffsetModalVisible(false)}
                color={playerStyle.colors.primaryContainer}
              />
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  optionsButton: {
    position: 'absolute',
    top: 10,
    left: 10,
    zIndex: 1, // add this line
  },
  offsetModalView: {
    position: 'absolute',
    top: 30,
    right: 10,
    width: '10%',
    backgroundColor: 'rgba(255, 255, 255, 0.8)',
    borderRadius: 10,
    alignItems: 'stretch',
    justifyContent: 'center',
  },
  lyricOffsetText: {
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    paddingVertical: 5,
  },
});
