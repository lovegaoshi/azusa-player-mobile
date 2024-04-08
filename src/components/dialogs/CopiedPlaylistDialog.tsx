import React, { useState } from 'react';
import { Pressable, View, FlatList, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import logger from '@utils/Logger';
import noxPlayingList from '@stores/playingList';

const { getState } = noxPlayingList;

interface Props {
  visible: boolean;
  fromList: NoxMedia.Playlist;
  onClose?: () => void;
  onSubmit?: () => void;
}

export default ({
  visible,
  fromList,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const [playlistIndex, setPlaylistIndex] = useState('');
  const playlistRef = React.useRef<FlatList<string[]>>(null);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const playlists = useNoxSetting(state => state.playlists);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const handleClose = () => {
    setPlaylistIndex('');
    onClose();
  };

  const handleSubmit = () => {
    setPlaylistIndex('');
    logger.debug(`[SendTo] cmd received, sending to ${playlistIndex}`);
    if (!playlists[playlistIndex]) {
      logger.debug(`[SendTo] Sending to list ${playlistIndex} DNE`);
      onClose();
      return;
    }
    const toList = playlists[playlistIndex];
    updatePlaylist(toList, fromList.songList, []);
    onSubmit();
  };

  const playlistList = () => {
    const filteredPlaylists =
      getState().playmode === NoxEnum.RNTP.NoxRepeatMode.SUGGEST
        ? playlistIds
        : playlistIds.filter(val => val !== fromList.id);
    return filteredPlaylists.map(val => [val, playlists[val].title]);
  };

  React.useEffect(() => {
    // TODO: this is not scrolling?
    if (visible && getState().playmode === NoxEnum.RNTP.NoxRepeatMode.SUGGEST) {
      playlistRef.current?.scrollToIndex({
        index: playlistIds.indexOf(fromList.id),
      });
      setPlaylistIndex(fromList.id);
    }
  }, [visible]);

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
        <Dialog.Title style={styles.dialogTitle}>
          {t('CopiedPlaylistDialog.title', {
            title:
              fromList.title.length > 20
                ? fromList.title.substring(0, 20) + '...'
                : fromList.title,
          })}
        </Dialog.Title>
        <Dialog.Content style={styles.dialogContent}>
          <FlatList
            style={styles.dialogList}
            data={playlistList()}
            ref={playlistRef}
            renderItem={({ item }) => (
              <Pressable
                onPress={() => setPlaylistIndex(item[0])}
                style={styles.dialogItem}
              >
                <View style={styles.rowView}>
                  <RadioButton
                    value={item[0]}
                    status={playlistIndex === item[0] ? 'checked' : 'unchecked'}
                    onPress={() => setPlaylistIndex(item[0])}
                  />
                  <Text variant="titleLarge" style={styles.dialogText}>
                    {item[1]}
                  </Text>
                </View>
              </Pressable>
            )}
            keyExtractor={item => item[0]}
          />
        </Dialog.Content>
        <Dialog.Actions style={styles.dialogAction}>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  dialog: {
    minHeight: '50%',
  },
  dialogTitle: {
    maxHeight: 100,
  },
  dialogContent: {
    flex: 1,
    minHeight: '20%',
  },
  dialogList: {
    flex: 6,
  },
  dialogItem: {
    paddingVertical: 5,
  },
  dialogText: {
    paddingTop: 3,
  },
  dialogAction: {
    maxHeight: 60,
    paddingBottom: 0,
  },
  rowView: {
    flexDirection: 'row',
  },
});
