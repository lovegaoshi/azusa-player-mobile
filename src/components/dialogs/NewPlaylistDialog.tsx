import React, { useState } from 'react';
import { Button, Dialog, Portal, TextInput } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { dummyPlaylist } from '../../objects/Playlist';
import { useNoxSetting } from '../../hooks/useSetting';

interface InputProps {
  handleSubmit: () => void;
}
const Input = React.forwardRef(({ handleSubmit }: InputProps, ref) => {
  const { t } = useTranslation();
  const [playlistName, setPlaylistName] = useState('');
  const playerStyle = useNoxSetting(state => state.playerStyle);
  React.useImperativeHandle(
    ref,
    () => ({ clearText: () => setPlaylistName(''), playlistName }),
    [playlistName]
  );

  return (
    <TextInput
      style={{ flex: 5 }}
      label={String(t('NewPlaylistDialog.label'))}
      value={playlistName}
      onChangeText={(val: string) => setPlaylistName(val)}
      onSubmitEditing={handleSubmit}
      selectionColor={playerStyle.customColors.textInputSelectionColor}
      autoFocus
    />
  );
});

interface props {
  visible: boolean;
  fromList?: NoxMedia.Playlist;
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
  const addPlaylist = useNoxSetting(state => state.addPlaylist);
  const inputRef = React.useRef<any>();

  const handleClose = () => {
    inputRef?.current?.clearText();
    onClose();
  };

  const handleSubmit = () => {
    inputRef?.current?.clearText();
    const dummyList = dummyPlaylist();
    const newList = fromList
      ? {
          ...fromList,
          id: dummyList.id,
          title: inputRef.current.playlistName,
          type: dummyList.type,
        }
      : { ...dummyList, title: inputRef.current.playlistName };
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
          <Input handleSubmit={handleSubmit} ref={inputRef} />
        </Dialog.Content>
        <Dialog.Actions>
          <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
          <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
