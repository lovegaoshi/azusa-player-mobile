import * as React from 'react';
import { useTranslation } from 'react-i18next';

import GenericCheckDialog from '../../dialogs/GenericCheckDialog';
import SettingListItem from '../helpers/SettingListItem';
import useNoxSetting from '@stores/useApp';
import { Category, CategoryList } from '@utils/sponsorblock/Constants';

export default () => {
  const { t } = useTranslation();
  const sponsorBlockCat = useNoxSetting(
    state => state.playerSetting,
  ).sponsorBlockCat;
  const setPlayerSetting = useNoxSetting(state => state.setPlayerSetting);
  const [visible, setVisible] = React.useState(false);
  const [favLists, setFavLists] = React.useState<boolean[]>([]);

  const showDialog = () => setVisible(true);
  const hideDialog = () => setVisible(false);

  const onClick = async () => {
    setFavLists(CategoryList.map(v => sponsorBlockCat.includes(v)));
    showDialog();
  };

  const onSubmit = async (indices: boolean[]) => {
    setPlayerSetting({
      sponsorBlockCat: indices.reduce(
        (accumulator, currentValue, index) =>
          currentValue ? [...accumulator, CategoryList[index]] : accumulator,
        [] as Category[],
      ),
    });
    hideDialog();
  };

  return (
    <>
      <SettingListItem
        icon={'google-ads'}
        settingName={'SponsorBlockCategory'}
        onPress={onClick}
        settingCategory={'SponsorBlock'}
      />
      <GenericCheckDialog
        visible={visible}
        title={t('SponsorBlock.SponsorBlockCategoryTitle')}
        options={CategoryList}
        onSubmit={onSubmit}
        onClose={() => hideDialog()}
        selectedIndices={favLists}
        renderOptionTitle={v => t(`SponsorBlock.${v}`)}
      />
    </>
  );
};
