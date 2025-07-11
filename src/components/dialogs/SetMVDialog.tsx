import React, { useEffect } from 'react';
import { Button, Dialog, Portal, Checkbox } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import NoxInput from '@components/dialogs/NoxInput';
import { RESOLVE_TYPE } from '@utils/mediafetch/mainbackgroundfetch';
import { extractMV } from '@hooks/useTrackMV';

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
  const [mvHide, setMvHide] = React.useState<boolean>();

  const handleClose = () => {
    onClose();
  };
  const handleSubmit = () => {
    let finalText = text;
    if (text.startsWith('BV')) {
      finalText = JSON.stringify({ type: RESOLVE_TYPE.bvid, identifier: text });
    }
    onSubmit({ backgroundOverride: finalText, MVsync: mvSync, MVHide: mvHide });
  };

  useEffect(() => {
    setText(extractMV(song));
    setMvSync(song.MVsync);
    setMvHide(song.MVHide);
  }, [song, visible]);

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
        <Checkbox.Item
          style={{ justifyContent: 'flex-start' }}
          labelStyle={{ flexGrow: undefined, flexShrink: undefined }}
          status={mvSync ? 'checked' : 'unchecked'}
          onPress={() => setMvSync(v => !v)}
          label={t('SetMVDialog.MVSyncLabel')}
          position={'leading'}
        />
        <Checkbox.Item
          style={{ justifyContent: 'flex-start' }}
          labelStyle={{ flexGrow: undefined, flexShrink: undefined }}
          status={mvHide ? 'checked' : 'unchecked'}
          onPress={() => setMvHide(v => !v)}
          label={t('SetMVDialog.MVHideLabel')}
          position={'leading'}
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
