import { View } from 'react-native';

import useNoxSetting from '@stores/useApp';
import { RenderSetting } from '../helpers/RenderSetting';
import SBCategoryButton from './SBCategoryButton';

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <View>
        <RenderSetting
          item={{
            settingName: 'SponsorBlockEnabled',
            settingCategory: 'SponsorBlock',
          }}
        />
        <SBCategoryButton />
      </View>
    </View>
  );
};
