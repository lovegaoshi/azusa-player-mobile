import React, { useEffect } from 'react';
import { Button, Dialog, Portal } from 'react-native-paper';
import { StyleSheet } from 'react-native';
import { useTranslation } from 'react-i18next';

import NoxInput from '@components/dialogs/NoxInput';
import { TextInput } from 'react-native-gesture-handler';

interface Props {
  visible: boolean;
  cred?: NoxStorage.AListCred;
  onClose?: () => void;
  onSubmit?: (v: NoxStorage.AListCred) => void;
}

const NewPlaylistDialog = ({
  visible,
  cred,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState(cred?.[0] ?? '');
  const [pwd, setPwd] = React.useState(cred?.[1] ?? '');

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    setText('');
    setPwd('');
    onSubmit([text, pwd]);
  };

  useEffect(() => {
    setText(cred?.[0] ?? '');
    setPwd(cred?.[1] ?? '');
  }, [cred]);

  return (
    <Dialog visible={visible} onDismiss={handleClose} style={styles.dialog}>
      <Dialog.Title>{t('AList.Add')}</Dialog.Title>
      <Dialog.Content>
        <NoxInput
          label={t('AList.Site')}
          selectTextOnFocus={false}
          text={text}
          setText={setText}
        />
        <NoxInput
          label={t('AList.Password')}
          selectTextOnFocus={false}
          text={pwd}
          setText={setPwd}
          render={p => (
            // @ts-expect-error
            <TextInput {...p} secureTextEntry={true} />
          )}
        />
      </Dialog.Content>
      <Dialog.Actions>
        <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
        <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default (p: Props) => (
  <Portal>
    <NewPlaylistDialog {...p} />
  </Portal>
);

const styles = StyleSheet.create({
  dialog: {
    position: 'absolute',
    top: '20%',
    left: 0,
    right: 0,
  },
});
