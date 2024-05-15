/* eslint-disable react-hooks/exhaustive-deps */
import React, { useEffect, useState } from 'react';
import i18n from 'i18next';
import {
  Modal,
  View,
  StyleSheet,
  Text,
  FlatList,
  TouchableOpacity,
  Button,
  TextInput,
} from 'react-native';
import { Lrc as Lyric, KaraokeMode } from 'react-native-lyric';
import { Track, useProgress } from 'react-native-track-player';
import { IconButton } from 'react-native-paper';

import { searchLyricOptions, searchLyric } from '@utils/LyricFetch';
import { reExtractSongName } from '@stores/appStore';
import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import { LrcSource } from '@enums/LyricFetch';
import useLyric from '@hooks/useLyricRN';

const LYRIC_OFFSET_INTERVAL = 0.5;

interface ModalContainerProps {
  children: React.JSX.Element[];
  visible: boolean;
  onRequestClose: () => void;
}

export const ModalContainer: React.FC<ModalContainerProps> = ({
  children,
  visible,
  onRequestClose,
}) => {
  return (
    <Modal
      animationType="slide"
      transparent={true}
      visible={visible}
      onRequestClose={onRequestClose}
    >
      <View style={styles.modalBackground}>
        <View style={styles.modalView}>{children}</View>
      </View>
    </Modal>
  );
};

interface LyricViewProps {
  track: Track;
  artist: string;
  height?: number;
  showUI?: boolean;
  noScrollThrottle?: boolean;
  onPress?: () => void;
  visible?: boolean;
}

export const LyricView = ({
  track,
  artist,
  height,
  showUI = true,
  noScrollThrottle = true,
  onPress = () => undefined,
  visible = true,
}: LyricViewProps) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const { position } = useProgress(
    playerSetting.karaokeLyrics ? 50 : undefined
  );
  const [modalVisible, setModalVisible] = useState(false);
  const [lyricSearchModalVisible, setLyricSearchModalVisible] = useState(false);
  const [offsetModalVisible, setOffsetModalVisible] = useState(false);

  const playerStyle = useNoxSetting(state => state.playerStyle);
  const {
    getLrcFromLocal,
    hasLrcFromLocal,
    updateLyricMapping,
    searchAndSetCurrentLyric,
    lrc,
    setLrc,
    lrcOption,
    setLrcOption,
    lrcOptions,
    setLrcOptions,
    searchText,
    setSearchText,
    currentTimeOffset,
    setCurrentTimeOffset,
  } = useLyric(track.song);

  useEffect(() => {
    if (track === undefined || track.title === '') return;

    const loadLocalLrc = async (
      lyricPromise: Promise<NoxNetwork.NoxFetchedLyric[]>
    ) => {
      const localLrcColle = await getLrcFromLocal(track?.song);
      if (localLrcColle === undefined) return false;
      const lrcKey = localLrcColle.lrcDetail.lyricKey;
      setLrcOption({ key: lrcKey, songMid: lrcKey, label: lrcKey });
      setCurrentTimeOffset(localLrcColle.lrcDetail.lyricOffset);
      if (localLrcColle.localLrc) {
        setLrc(localLrcColle.localLrc);
      } else {
        logger.debug('[lrc] local lrc no longer exists, fetching new...');
        searchAndSetCurrentLyric(
          0,
          await lyricPromise,
          localLrcColle.lrcDetail
        );
      }
      return true;
    };
    (async () => {
      logger.debug('[lrc] Initiating Lyric with new track...');
      // HACK: UX is too bad if this is not always fetched
      const lrcOptionPromise = fetchAndSetLyricOptions();
      setCurrentTimeOffset(0);
      setLrcOption(undefined);
      setLrc(i18n.t('Lyric.loading'));
      setSearchText(track.title || '');
      // Initialize from storage if not new
      const localLrcLoaded = await loadLocalLrc(lrcOptionPromise);
      if (!localLrcLoaded) {
        lrcOptionPromise.then(v => searchAndSetCurrentLyric(undefined, v));
      }
    })();
  }, [track]);

  useEffect(() => {
    if (!hasLrcFromLocal(track?.song)) {
      searchAndSetCurrentLyric();
    }
  }, [lrcOptions]);

  const addSubtractOffset = (isAdd: boolean) => {
    const newTimeOffset = isAdd
      ? currentTimeOffset + LYRIC_OFFSET_INTERVAL
      : currentTimeOffset - LYRIC_OFFSET_INTERVAL;
    setCurrentTimeOffset(newTimeOffset);
    updateLyricMapping({
      resolvedLrc: lrcOption,
      newLrcDetail: { lyricOffset: newTimeOffset },
      lrc,
      song: track.song,
      currentTimeOffset: newTimeOffset,
    });
  };

  const fetchAndSetLyricOptions = async (adhocTitle?: string) => {
    if (track.title === undefined) return [];
    try {
      const titleToFetch = reExtractSongName(
        adhocTitle === undefined ? track.title : adhocTitle,
        artist
      );
      const options = await Promise.all(
        [
          LrcSource.QQQrc,
          LrcSource.QQ,
          LrcSource.BiliBili,
          LrcSource.Kugou,
        ].map(source =>
          searchLyricOptions({
            searchKey: titleToFetch,
            source,
            song: track.song,
          })
        )
      );
      if (options[0].length !== 1) {
        options.push(options.shift()!);
      }
      const flattenedOptions = options.flat();
      setLrcOptions(flattenedOptions);
      return flattenedOptions;
    } catch (error) {
      logger.error(`[lrc] Error fetching lyric options:${error}`);
      setLrcOptions([]);
    }
    return [];
  };

  const LyricOptions = (key: string) => {
    setModalVisible(false);
    switch (key) {
      case 'LyricOptions': {
        setLyricSearchModalVisible(true);
        break;
      }
      case 'LyricOffset': {
        setOffsetModalVisible(true);
        break;
      }
    }
  };

  const customizedStyles = {
    headerText: [styles.headerText, { color: playerStyle.colors.primary }],
    modelContainer: [
      styles.modalHeader,
      { backgroundColor: playerStyle.colors.primaryContainer },
    ],
  };

  if (!visible) return null;

  return (
    <View style={styles.container}>
      <Lyric
        style={{ marginTop: 30, height: 500 }}
        lrc={lrc}
        currentTime={(position + currentTimeOffset) * 1000}
        lineHeight={32}
        height={height}
        noScrollThrottle={noScrollThrottle}
        onPress={onPress}
        karaokeOnColor={playerStyle.colors.primary}
        karaokeOffColor={playerStyle.colors.secondary}
        karaokeMode={
          playerSetting.karaokeLyrics ? KaraokeMode.OnlyRealKaraoke : undefined
        }
      />
      {showUI && (
        <>
          <View style={styles.optionsButton}>
            <IconButton
              icon="more"
              onPress={() => setModalVisible(!modalVisible)}
            />
          </View>
          <ModalContainer
            visible={modalVisible}
            onRequestClose={() => setModalVisible(false)}
          >
            <View style={customizedStyles.modelContainer}>
              <Text style={customizedStyles.headerText}>更多</Text>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <IconButton
                  iconColor={playerStyle.colors.primary}
                  icon="chevron-down"
                />
              </TouchableOpacity>
            </View>
            <FlatList
              style={{ backgroundColor: playerStyle.colors.primaryContainer }}
              data={[
                { key: 'LyricOptions', title: '更换歌词' },
                { key: 'LyricOffset', title: '歌词时间调整' },
              ]}
              renderItem={({ item }) => (
                <TouchableOpacity onPress={() => LyricOptions(item.key)}>
                  <Text
                    style={[
                      styles.listItem,
                      { color: playerStyle.colors.secondary },
                    ]}
                  >
                    {item.title}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.key}
            />
          </ModalContainer>

          <ModalContainer
            visible={lyricSearchModalVisible}
            onRequestClose={() => setLyricSearchModalVisible(false)}
          >
            <View style={customizedStyles.modelContainer}>
              <Text style={customizedStyles.headerText}>歌词搜索</Text>
              <TouchableOpacity
                onPress={() => setLyricSearchModalVisible(false)}
              >
                <IconButton
                  iconColor={playerStyle.colors.primary}
                  icon="chevron-down"
                />
              </TouchableOpacity>
            </View>
            <TextInput
              style={[
                styles.searchBar,
                {
                  backgroundColor: playerStyle.colors.primaryContainer,
                  color: playerStyle.colors.primary,
                },
              ]}
              value={searchText}
              onChangeText={setSearchText}
              placeholder={track === undefined ? '' : track.title}
              onSubmitEditing={() => fetchAndSetLyricOptions(searchText)}
              selectionColor={playerStyle.customColors.textInputSelectionColor}
            />
            <FlatList
              style={{ backgroundColor: playerStyle.colors.primaryContainer }}
              data={lrcOptions}
              renderItem={({ item, index }) => (
                <TouchableOpacity
                  onPress={() => searchAndSetCurrentLyric(index)}
                >
                  <Text
                    style={[
                      styles.listItem,
                      { color: playerStyle.colors.secondary },
                    ]}
                  >
                    {item.label}
                  </Text>
                </TouchableOpacity>
              )}
              keyExtractor={item => item.key}
            />
          </ModalContainer>

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
                  { backgroundColor: playerStyle.colors.primaryContainer },
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
  centeredView: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 22,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'flex-end',
    backgroundColor: 'rgba(0, 0, 0, 0.1)',
  },

  modalView: {
    backgroundColor: 'white',
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    maxHeight: '50%',
  },

  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: 'grey',
    padding: 10,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },

  headerText: {
    fontSize: 20,
    fontWeight: 'bold',
    color: 'white',
  },

  listItem: {
    padding: 10,
    fontSize: 16,
    borderTopColor: 'grey',
  },
  searchBar: {
    height: 40,
    paddingLeft: 15,
    backgroundColor: '#f0f0f0',
    fontSize: 16,
    color: '#333',
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

  lyricOffsetButton: {
    backgroundColor: 'grey',
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    textAlign: 'center',
    paddingVertical: 5,
  },
  lyricOffsetText: {
    fontSize: 12,
    color: 'black',
    textAlign: 'center',
    paddingVertical: 5,
  },
});
