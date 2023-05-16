import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Provider,
  TextInput,
  Text,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { dummyPlaylist } from '../../objects/Playlist';
import { useNoxSetting } from '../../hooks/useSetting';

interface props {
  visible: boolean;
  fromList?: NoxMedia.Playlist;
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
  const [playlistName, setPlaylistName] = useState('');
  const addPlaylist = useNoxSetting(state => state.addPlaylist);

  const handleClose = () => {
    setPlaylistName('');
    onClose();
  };

  const handleSubmit = () => {
    setPlaylistName('');
    const dummyList = dummyPlaylist();
    const newList = fromList
      ? {
          ...fromList,
          id: dummyList.id,
          title: playlistName,
          type: dummyList.type,
        }
      : { ...dummyList, title: playlistName };
    console.log(newList, fromList);
    addPlaylist(newList);
    onSubmit();
  };

  return (
    <Portal>
      <Dialog
        visible={visible}
        onDismiss={handleClose}
        style={{
          position: 'absolute',
          top: '20%',
          left: 0,
          right: 0,
        }}
      >
        <Dialog.Title>
          {fromList
            ? t('NewPlaylistDialog.title', { fromList })
            : t('NewPlaylistDialog.titleNew')}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={{ flex: 5 }}
            label={String(t('NewPlaylistDialog.label'))}
            value={playlistName}
            onChangeText={(val: string) => setPlaylistName(val)}
            onSubmitEditing={handleSubmit}
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
