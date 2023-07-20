import * as React from 'react';
import {
  createNativeStackNavigator,
  NativeStackNavigationProp,
} from '@react-navigation/native-stack';
import { Pressable } from 'react-native';
import { ParamListBase, useNavigation } from '@react-navigation/native';
import { List, MD3Colors, IconButton, Text } from 'react-native-paper';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ScrollView } from 'react-native-gesture-handler';
import { useTranslation } from 'react-i18next';
import { Image } from 'expo-image';
import { Dimensions } from 'react-native';

import { useNoxSetting } from '../../hooks/useSetting';
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
        contentFit="contain"
        style={style}
      />
    </Pressable>
  );
};
