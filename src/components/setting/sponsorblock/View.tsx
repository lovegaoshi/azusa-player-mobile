import { View } from 'react-native';

import useNoxSetting from '@stores/useApp';
import { RenderSetting } from '../helpers/RenderSetting';
import CheckDialogWrapper, { CheckDialogChildren } from '../CheckDialogWrapper';
import SBCategoryButton from './SBCategoryButton';

interface Props extends CheckDialogChildren<any> {}

const Home = ({ setCurrentCheckOption, setCheckVisible }: Props) => {
  return (
    <View>
      <RenderSetting
        item={{
          settingName: 'sponsorBlockEnabled',
          settingCategory: 'DeveloperSettings',
        }}
      />
      <SBCategoryButton />
    </View>
  );
};

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <View
      style={{
        backgroundColor: playerStyle.customColors.maskedBackgroundColor,
        flex: 1,
      }}
    >
      <CheckDialogWrapper Children={p => <Home {...p} />} />
    </View>
  );
};
