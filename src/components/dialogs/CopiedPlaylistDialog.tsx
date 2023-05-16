import React, { useState } from 'react';
import { Pressable, View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Provider,
  TextInput,
  Text,
  RadioButton,
} from 'react-native-paper';
import { FlashList } from '@shopify/flash-list';
import { useTranslation } from 'react-i18next';
import Playlist, { dummyPlaylist } from '../../objects/Playlist';
import { useNoxSetting } from '../../hooks/useSetting';
import { styles } from '../style';
interface props {
  visible: boolean;
  fromList: Playlist;
  onClose?: () => void;
  onSubmit?: () => void;
}

export default ({
  visible,
  fromList,
  onClose = () => void 0,
  onSubmit = () => void 0,
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
    console.log(fromList.songList, playlistIndex);
    const toList = playlists[playlistIndex];
    updatePlaylist(toList, fromList.songList, []);
    onSubmit();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleClose}
        style={{ maxHeight: '70%' }}
      >
        <Dialog.Title>{t('CopiedPlaylistDialog.title', {fromList})}</Dialog.Title>
        <Dialog.Content style={{ ...styles.topBarContainer, height: '70%' }}>
          <FlashList
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
            estimatedItemSize={20}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
