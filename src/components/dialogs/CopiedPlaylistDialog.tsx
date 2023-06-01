import React, { useState } from 'react';
import { Pressable, View, FlatList } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '../../hooks/useSetting';
interface props {
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
}: props) => {
  const { t } = useTranslation();
  const [playlistIndex, setPlaylistIndex] = useState('');
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const playlists = useNoxSetting(state => state.playlists);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const handleClose = () => {
    setPlaylistIndex('');
    onClose();
  };

  const handleSubmit = () => {
    setPlaylistIndex('');
    if (!playlists[playlistIndex]) {
      onClose();
      return;
    }
    const toList = playlists[playlistIndex];
    updatePlaylist(toList, fromList.songList, []);
    onSubmit();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleClose}
        style={{ maxHeight: '60%', minHeight: '50%' }}
      >
        <Dialog.Title style={{ maxHeight: 100 }}>
          {t('CopiedPlaylistDialog.title', {
            title:
              fromList.title.length > 20
                ? fromList.title.substring(0, 20) + '...'
                : fromList.title,
          })}
        </Dialog.Title>
        <Dialog.Content style={{ flex: 1, minHeight: '20%' }}>
          <FlatList
            style={{ flex: 6 }}
            data={playlistIds
              .filter(val => val !== fromList.id)
              .map(val => [val, playlists[val].title])}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setPlaylistIndex(item[0])}
                style={{ paddingVertical: 5 }}
              >
                <View style={{ flexDirection: 'row' }}>
                  <RadioButton
                    value={item[0]}
                    status={playlistIndex === item[0] ? 'checked' : 'unchecked'}
                    onPress={() => setPlaylistIndex(item[0])}
                  />
                  <Text variant="titleLarge" style={{ paddingTop: 3 }}>
                    {item[1]}
                  </Text>
                </View>
              </Pressable>
            )}
            keyExtractor={item => item[0]}
          />
        </Dialog.Content>
        <Dialog.Actions style={{ maxHeight: 60, paddingBottom: 0 }}>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
