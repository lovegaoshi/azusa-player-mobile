import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SettingEntry } from './SettingEntry';
import BooleanSetting from './BooleanSetting';

interface Props {
  item: SettingEntry;
  delayedLoading?: boolean;
}

export const RenderSetting = React.memo(
  ({ item, delayedLoading }: Props) => {
    switch (item.settingType) {
      default:
        return (
          <BooleanSetting
            {...item}
            delayedLoading={delayedLoading}
            key={uuidv4()}
          />
        );
    }
  },
  (p, r) => {
    console.log('memo', p, r);
    return true;
  },
);
