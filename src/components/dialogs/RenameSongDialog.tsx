import React, { useState } from 'react';
import {
  Button,
  Dialog,
  Portal,
  Provider,
  Text,
  TextInput,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { useNoxSetting } from '../../hooks/useSetting';

interface props {
  visible: boolean;
  song: NoxMedia.Song;
  onClose?: () => void;
  onSubmit?: (rename: string) => void;
}

export default ({
  visible,
  song,
  onClose = () => undefined,
  onSubmit = (rename: string) => undefined,
}: props) => {
  const { t } = useTranslation();
  const [name, setName] = useState(song.name);
  const playerStyle = useNoxSetting(state => state.playerStyle);

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
        <Dialog.Title>{t('RenameSongDialog.title', { song })}</Dialog.Title>
        <Dialog.Content>
          <TextInput
            label={String(t('RenameSongDialog.label'))}
            value={name}
            onChangeText={(val: string) => setName(val)}
            onSubmitEditing={handleSubmit}
            selectTextOnFocus
            selectionColor={playerStyle.customColors.textInputSelectionColor}
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
