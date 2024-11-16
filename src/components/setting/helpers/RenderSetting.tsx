import React from 'react';
import { v4 as uuidv4 } from 'uuid';

import { SettingEntry } from './SettingEntry';
import BooleanSetting from './BooleanSetting';

interface Props {
  item: SettingEntry;
}

export const RenderSetting = ({ item }: Props) => {
  switch (item.settingType) {
    default:
      return <BooleanSetting {...item} key={uuidv4()} />;
  }
};
