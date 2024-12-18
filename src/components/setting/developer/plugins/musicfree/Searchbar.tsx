import React from 'react';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import logger from '@utils/Logger';
import SearchBar from '@components/commonui/SearchBar';
import { getUniqObjects } from '@utils/Utils';

export default () => {
  const { t } = useTranslation();
  const playerStyles = useNoxSetting(state => state.playerStyles);
  const setPlayerStyles = useNoxSetting(state => state.setPlayerStyles);
  const loadCustomSkin = (skins: NoxTheme.Style[]) => {
    // skins MUST BE an array of objects
    if (!Array.isArray(skins)) {
      throw new Error('requested skin URL is not an array. aborting.');
    }
    const uniqueSkins = getUniqObjects(
      skins.filter(skin => skin.metaData).concat(playerStyles),
      () => '',
    );
    setPlayerStyles(uniqueSkins);
  };

  return (
    <SearchBar
      defaultSearchText="https://raw.githubusercontent.com/lovegaoshi/azusa-player-mobile/master/src/components/styles/steria.json"
      onSearch={async ({ v, setSnack }) => {
        try {
          const res = await fetch(v);
          const searchedResult = await res.json();
          loadCustomSkin(searchedResult);
        } catch (e) {
          logger.warn(`[SkinSearchbar] failed to search ${e}`);
          setSnack({
            snackMsg: { success: t('CustomSkin.SearchFailMsg') },
          });
        }
      }}
      placeholder={t('CustomSkin.SearchBarLabel')}
    />
  );
};
