import * as React from 'react';
import { Pressable } from 'react-native';
import Image from 'react-native-fast-image';
import { Dimensions } from 'react-native';

import { useNoxSetting } from '@hooks/useSetting';
import { localSplashes } from '../background/AppOpenSplash';

const style = {
  flex: 1,
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width,
};

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [index, setIndex] = React.useState(0);

  const nextImage = () => {
    setIndex(index < localSplashes.length - 1 ? index + 1 : 0);
  };

  return (
    <Pressable onPress={nextImage} style={style}>
      <Image
        source={localSplashes[index]()}
        style={style}
        resizeMode={Image.resizeMode.contain}
      />
    </Pressable>
  );
};
