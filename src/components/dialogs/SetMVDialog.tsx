import React, { useEffect } from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import NoxInput from '@components/dialogs/NoxInput';
import { RESOLVE_TYPE } from '@utils/mediafetch/mainbackgroundfetch';

interface Props {
  visible: boolean;
  song: NoxMedia.Song;
  onClose?: () => void;
  onSubmit?: (rename: string) => void;
}

const SongDialog = ({
  visible,
  song,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState(song.bvid);

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    let finalText = text;
    if (text.startsWith('BV')) {
      finalText = JSON.stringify({ type: RESOLVE_TYPE.bvid, identifier: text });
    }
    onSubmit(finalText);
  };

  useEffect(() => {
    setText(song.bvid);
  }, [song]);

  return (
    <Dialog visible={visible} onDismiss={handleClose}>
      <Dialog.Title>{t('SetMVDialog.title', { song })}</Dialog.Title>
      <Dialog.Content>
        <NoxInput
          handleSubmit={handleSubmit}
          label={t('SetMVDialog.label')}
          text={text}
          setText={setText}
        />
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
        <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default (p: Props) => {
  return (
    <Portal>
      <SongDialog {...p} />
    </Portal>
  );
};
