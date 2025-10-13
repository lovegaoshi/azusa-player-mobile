import { View } from 'react-native';

import useNoxSetting from '@stores/useApp';
import { RenderSetting } from '../helpers/RenderSetting';
import SBCategoryButton from './SBCategoryButton';

export default function SBView() {
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
            settingName: 'sponsorBlockEnabled',
            settingCategory: 'SponsorBlock',
          }}
        />
        <SBCategoryButton />
      </View>
    </View>
  );
}
