import React, { useState } from 'react';
import { Pressable, View, FlatList } from 'react-native';
import { Button, Dialog, Portal, Text, RadioButton } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '../../hooks/useSetting';
import { styles } from '../style';

const dialogStyle = { maxHeight: '60%', minHeight: '50%' };
const dialogTitleStyle = { maxHeight: 100 };
const dialogContentStyle = { flex: 1, minHeight: '20%' };
const dialogListStyle = { flex: 6 };
const dialogItemStyle = { paddingVertical: 5 };
const dialogTextStyle = { paddingTop: 3 };
const dialogActionStyle = { maxHeight: 60, paddingBottom: 0 };

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
        style={dialogStyle}
      >
        <Dialog.Title style={dialogTitleStyle}>
          {t('CopiedPlaylistDialog.title', {
            title:
              fromList.title.length > 20
                ? fromList.title.substring(0, 20) + '...'
                : fromList.title,
          })}
        </Dialog.Title>
        <Dialog.Content style={dialogContentStyle}>
          <FlatList
            style={dialogListStyle}
            data={playlistIds
              .filter(val => val !== fromList.id)
              .map(val => [val, playlists[val].title])}
            renderItem={({ item, index }) => (
              <Pressable
                onPress={() => setPlaylistIndex(item[0])}
                style={dialogItemStyle}
              >
                <View style={styles.rowView}>
                  <RadioButton
                    value={item[0]}
                    status={playlistIndex === item[0] ? 'checked' : 'unchecked'}
                    onPress={() => setPlaylistIndex(item[0])}
                  />
                  <Text variant="titleLarge" style={dialogTextStyle}>
                    {item[1]}
                  </Text>
                </View>
              </Pressable>
            )}
            keyExtractor={item => item[0]}
          />
        </Dialog.Content>
        <Dialog.Actions style={dialogActionStyle}>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
