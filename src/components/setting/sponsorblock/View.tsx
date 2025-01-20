import { View } from 'react-native';

import useNoxSetting from '@stores/useApp';
import { RenderSetting } from '../helpers/RenderSetting';
import CheckDialogWrapper, { CheckDialogChildren } from '../CheckDialogWrapper';

interface Props extends CheckDialogChildren<any> {}

const Home = ({ setCurrentCheckOption, setCheckVisible }: Props) => {
  return (
    <RenderSetting
      item={{
        settingName: 'sponsorBlockEnabled',
        settingCategory: 'DeveloperSettings',
      }}
    />
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
