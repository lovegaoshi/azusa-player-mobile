import { ActivityIndicator } from 'react-native-paper';
import { Props } from 'react-native-paper/src/components/ActivityIndicator';
import {
  Host,
  CircularProgressIndicator,
  CircularWavyProgressIndicator,
} from '@expo/ui/jetpack-compose';

import { useNoxSetting } from '@stores/useApp';
import { isAndroid } from '@utils/RNUtils';
import { View } from 'react-native';

interface MyProps extends Props {
  wavy?: boolean;
  trackColor?: string;
}

const MD3SizeToPaperSize = 40;

export default (p: MyProps) => {
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const MD3Indicator = p.wavy
    ? CircularWavyProgressIndicator
    : CircularProgressIndicator;

  if (playerSetting.md3slider && isAndroid) {
    return (
      <View style={[p.style, { justifyContent: 'center' }]}>
        <Host
          matchContents
          style={[
            {
              transform: [
                {
                  scale:
                    typeof p.size === 'number'
                      ? (p.size ?? MD3SizeToPaperSize) / MD3SizeToPaperSize
                      : 1,
                },
              ],
              alignSelf: 'center',
              marginHorizontal: 6 + 3,
            },
          ]}
        >
          <MD3Indicator
            color={p.theme?.colors?.primary ?? playerStyle.colors.primary}
            trackColor={p.trackColor}
          />
        </Host>
      </View>
    );
  }
  return <ActivityIndicator {...p} />;
};
