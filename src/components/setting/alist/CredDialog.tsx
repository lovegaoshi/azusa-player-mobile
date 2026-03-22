import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import { GenericDialog } from '@components/dialogs/GenericDialog';
import NoxInput from '@components/dialogs/NoxInput';
import { Portal } from 'react-native-paper';

interface Props {
  visible: boolean;
  cred?: NoxStorage.AListCred;
  onClose?: () => void;
  onSubmit?: (v: NoxStorage.AListCred) => void;
}

const CredDialog = ({
  visible,
  cred,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState(cred?.[0] ?? '');
  const [pwd, setPwd] = React.useState(cred?.[1] ?? '');
  const [site, setSite] = React.useState(cred?.[2] ?? '');

  const handleSubmit = () => {
    setText('');
    setPwd('');
    setSite('');
    onSubmit([text, pwd, site]);
  };

  useEffect(() => {
    setText(cred?.[0] ?? '');
    setPwd(cred?.[1] ?? '');
    setSite(cred?.[2] ?? '');
  }, [cred]);

  return (
    <GenericDialog
      visible={visible}
      title={t('AList.Add')}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
      <NoxInput
        autofocus={true}
        label={t('AList.Site')}
        selectTextOnFocus={false}
        text={text}
        setText={setText}
      />
      <NoxInput
        autofocus={false}
        label={t('AList.Password')}
        selectTextOnFocus={false}
        text={pwd}
        setText={setPwd}
      />
      <NoxInput
        autofocus={false}
        label={t('AList.SitePath')}
        selectTextOnFocus={false}
        text={site}
        setText={setSite}
      />
    </GenericDialog>
  );
};

export default function CredDialogPortal(p: Props) {
  return (
    <Portal>
      <CredDialog {...p} />
    </Portal>
  );
}
