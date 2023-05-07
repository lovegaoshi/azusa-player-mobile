import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import { styles } from '../style';
import { IconButton } from 'react-native-paper';
import { useNavigation, ParamListBase } from '@react-navigation/native';
import { DrawerNavigationProp } from '@react-navigation/drawer';
import { ViewEnum } from '../../enums/View';

export default ({
  navigation,
}: {
  navigation: DrawerNavigationProp<ParamListBase>;
}) => {
  const navigationGlobal = useNavigation();

  return (
    <View style={styles.topBarContainer}>
      <IconButton
        icon="menu"
        onPress={() => navigation.openDrawer()}
        style={{ flex: 1 }}
      />
      <Text style={{ flex: 4 }}>{''}</Text>
      <IconButton
        icon="playlist-music"
        onPress={() =>
          navigationGlobal.navigate(ViewEnum.PLAYER_PLAYLIST as never)
        }
        style={{ flex: 1 }}
      />
    </View>
  );
};
