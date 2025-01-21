import * as React from 'react';
import { useTranslation } from 'react-i18next';

import GenericCheckDialog from '../../dialogs/GenericCheckDialog';
import SettingListItem from '../helpers/SettingListItem';
import useNoxSetting from '@stores/useApp';
import { Category } from '@utils/sponsorblock/Constants';

export default () => {
  const { t } = useTranslation();
  const sponsorBlockCat = useNoxSetting(
    state => state.playerSetting,
  ).sponsorBlockCat;
  const [visible, setVisible] = React.useState(false);
  const [favLists, setFavLists] = React.useState<Category[]>([]);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const onClick = async () => {
    setFavLists(sponsorBlockCat);
    showDialog();
  };

  const onSubmit = async (indices: boolean[]) => {
    console.log(indices);
    hideDialog();
  };

  return (
    <>
      <SettingListItem
        icon={'google-ads'}
        settingName={'sponsorBlockCategory'}
        onPress={onClick}
        settingCategory={'DeveloperSettings'}
      />
      <GenericCheckDialog
        visible={visible}
        title={t('Login.SyncBiliFavlist')}
        options={favLists}
        onSubmit={onSubmit}
        onClose={() => hideDialog()}
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        renderOptionTitle={(val: any) => val.title}
      />
    </>
  );
};
