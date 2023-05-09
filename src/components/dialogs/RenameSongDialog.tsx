import React, { useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Provider,
  Text,
  TextInput,
} from 'react-native-paper';
import Song from '../../objects/SongInterface';

interface props {
  visible: boolean;
  song: Song;
  onClose?: () => void;
  onSubmit?: (rename: string) => void;
}

export default ({
  visible,
  song,
  onClose = () => void 0,
  onSubmit = (rename: string) => void 0,
}: props) => {
  const [name, setName] = useState(song.name);

  React.useEffect(() => {
    setName(song.name);
  }, [song]);

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    onSubmit(name);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Title>{`Rename ${song.name} to...`}</Dialog.Title>
        <KeyboardAvoidingView style={{ minHeight: '10%' }}>
          <Dialog.Content>
            <TextInput
              label="Song name"
              value={name}
              onChangeText={(val: string) => setName(val)}
              onSubmitEditing={handleSubmit}
              selectTextOnFocus
            />
          </Dialog.Content>
        </KeyboardAvoidingView>

        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button onPress={handleSubmit}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
