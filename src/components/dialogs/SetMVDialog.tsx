import React, { useEffect } from 'react';
import { Button, Dialog, Portal, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';
import { Pressable, View } from 'react-native';

import { PaperText as Text } from '@components/commonui/ScaledText';
import NoxInput from '@components/dialogs/NoxInput';
import { RESOLVE_TYPE } from '@utils/mediafetch/mainbackgroundfetch';

interface Props {
  visible: boolean;
  song: NoxMedia.Song;
  onClose?: () => void;
  onSubmit?: (s: Partial<NoxMedia.Song>) => void;
}

const SongDialog = ({
  visible,
  song,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState('');
  const [mvSync, setMvSync] = React.useState<boolean>();

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    let finalText = text;
    if (text.startsWith('BV')) {
      finalText = JSON.stringify({ type: RESOLVE_TYPE.bvid, identifier: text });
    }
    onSubmit({ backgroundOverride: finalText, MVsync: mvSync });
  };

  useEffect(() => {
    setText(song.bvid);
    setMvSync(song.MVsync);
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
        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
          <Checkbox
            status={mvSync ? 'checked' : 'unchecked'}
            onPress={() => setMvSync(v => !v)}
          />
          <Pressable onPress={() => setMvSync(v => !v)}>
            <Text>{t('SetMVDialog.MVSynclabel')}</Text>
          </Pressable>
        </View>
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
