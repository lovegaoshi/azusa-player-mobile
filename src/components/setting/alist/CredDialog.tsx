import React, { useEffect } from 'react';
import { useTranslation } from 'react-i18next';

import GenericDialog from '@components/dialogs/GenericDialog';
import NoxInput from '@components/dialogs/NoxInput';

interface Props {
  visible: boolean;
  cred?: NoxStorage.AListCred;
  onClose?: () => void;
  onSubmit?: (v: NoxStorage.AListCred) => void;
}

export default ({
  visible,
  cred,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const [text, setText] = React.useState(cred?.[0] ?? '');
  const [pwd, setPwd] = React.useState(cred?.[1] ?? '');

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
    <GenericDialog
      visible={visible}
      title={t('AList.AddCred')}
      onClose={onClose}
      onSubmit={handleSubmit}
    >
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
        secureTextEntry={true}
      />
    </GenericDialog>
  );
};
