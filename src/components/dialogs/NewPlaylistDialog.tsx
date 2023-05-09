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
import Playlist, { dummyPlaylist } from '../../objects/Playlist';
import { useNoxSetting } from '../../hooks/useSetting';

interface props {
  visible: boolean;
  fromList?: Playlist;
  onClose?: () => void;
  onSubmit?: () => void;
}

export default ({
  visible,
  fromList,
  onClose = () => void 0,
  onSubmit = () => void 0,
}: props) => {
  const [playlistName, setPlaylistName] = useState('');
  const addPlaylist = useNoxSetting(state => state.addPlaylist);

  const handleClose = () => {
    console.log('dfsfsf');
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
            ? `Create ${fromList.title} as New Playlist...`
            : 'Create New Playlist...'}
        </Dialog.Title>
        <Dialog.Content>
          <TextInput
            style={{ flex: 5 }}
            label="Playlist name"
            value={playlistName}
            onChangeText={(val: string) => setPlaylistName(val)}
            onSubmitEditing={handleSubmit}
          />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button onPress={handleSubmit}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
