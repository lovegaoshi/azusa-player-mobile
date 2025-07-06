/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  StyleSheet,
  Button,
  ViewStyle,
  Pressable,
} from 'react-native';
import { Lrc as Lyric, KaraokeMode } from 'react-native-lyric';
import { Track, useProgress } from 'react-native-track-player';
import { IconButton, ActivityIndicator } from 'react-native-paper';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { useNoxSetting } from '@stores/useApp';
import useLyric from '@hooks/useLyricRN';
import { NativeText as Text } from '@components/commonui/ScaledText';
import LyricBottomSheet from './LyricBottomSheet';
import { NoxSheetRoutes } from '@enums/Routes';
import { useIsLandscape } from '@hooks/useOrientation';
import { TPSeek } from '@stores/RNObserverStore';

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

const SpotifyLyricStyle = {
  align: 'left',
  fontSize: 20,
  activeFontSize: 20,
  lapsedAsActiveColor: true,
};

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
  const isLandscape = useIsLandscape();
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const { position } = useProgress(
    playerSetting.karaokeLyrics ? 50 : undefined,
  );
  const [offsetModalVisible, setOffsetModalVisible] = useState(false);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const usedLyric = useLyric(track.song, artist);
  const {
    loading,
    hasLrcFromLocal,
    searchAndSetCurrentLyric,
    addSubtractOffset,
    initTrackLrcLoad,
    lrc,
    lrcOptions,
    currentTimeOffset,
  } = usedLyric;
  const spotifyLyricStyle = playerSetting.spotifyLyricStyle
    ? SpotifyLyricStyle
    : {};

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
    <View style={style}>
      <LyricBottomSheet
        showLyricOffsetModal={() => setOffsetModalVisible(true)}
        usedLyric={usedLyric}
      />
      {loading ? (
        <Pressable onPress={onPress}>
          <ActivityIndicator
            size={70}
            // HACK: ???
            style={styles.lrcView}
          />
        </Pressable>
      ) : (
        <Lyric
          fontScale={
            (playerSetting.lyricFontScale || playerSetting.fontScale) ?? 1
          }
          style={styles.lrcView}
          lrc={lrc}
          currentTime={(position + currentTimeOffset) * 1000}
          height={height}
          noScrollThrottle={noScrollThrottle}
          onPress={onPress}
          // HACK: this is NOT any. this is LrcLine. need to fix with ts
          onLinePress={
            playerSetting.lyricTap
              ? (v: any) => TPSeek(v.millisecond / 1000)
              : onPress
          }
          karaokeOnColor={
            playerStyle.colors.karaokeOn ?? playerStyle.colors.onSurface
          }
          karaokeOffColor={
            playerStyle.colors.karaokeOff ?? playerStyle.colors.onSurfaceVariant
          }
          karaokeMode={
            playerSetting.karaokeLyrics
              ? KaraokeMode.OnlyRealKaraoke
              : undefined
          }
          {...spotifyLyricStyle}
        />
      )}

      {showUI && (
        <>
          <View
            style={
              isLandscape ? styles.optionsButtonLandscape : styles.optionsButton
            }
          >
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
  lrcView: { height: 500, paddingHorizontal: 20 },
  container: {
    flex: 1,
  },
  optionsButton: {
    position: 'absolute',
    top: -35,
    left: 10,
    zIndex: 1, // add this line
  },
  optionsButtonLandscape: {
    position: 'absolute',
    top: 50,
    zIndex: 1, // add this line
    opacity: 0.5,
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
