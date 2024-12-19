import React from 'react';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import logger from '@utils/Logger';
import SearchBar from '@components/commonui/SearchBar';
import { fetchMFsdk } from '@utils/mfsdk';

export default () => {
  const { t } = useTranslation();
  const addMFsdks = useNoxSetting(state => state.addMFsdks);
  return (
    <SearchBar
      defaultSearchText=""
      onSearch={async ({ v, setSnack }) => {
        try {
          addMFsdks(await fetchMFsdk(v));
        } catch (e) {
          logger.warn(`[mfsdk] failed to search ${v}: ${e}`);
          setSnack({
            snackMsg: { success: t('MFSDK.SearchFailMsg') },
          });
        }
      }}
      placeholder={t('MFSDK.url')}
    />
  );
};
