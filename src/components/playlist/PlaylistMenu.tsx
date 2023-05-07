import * as React from 'react';
import {
    Menu,
  } from 'react-native-paper';
import { useNoxSetting } from '../../hooks/useSetting';

enum ICONS {
  SETTINGS = '',
  BILISHAZAM = '',
  REMOVE_BILISHAZAM = '',
  ANALYTICS = '',
  REMOVE_BROKEN = '',
  RELOAD_BVIDS = '',
  CLEAR = '',
  REMOVE = '',
}

export default (visible: boolean, setVisible: (val: boolean) => void, selected: boolean[] = []) => {

  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const menuCoord = useNoxSetting(state => state.playlistMenuCoords);

  return (
      <Menu
          visible={visible}
          onDismiss={() => setVisible(false)}
          anchor={menuCoord}
        >
          <Menu.Item leadingIcon={ICONS.SETTINGS} onPress={() => {}} title="Settings" />
          <Menu.Item leadingIcon={ICONS.BILISHAZAM} onPress={() => {}} title="BiliShazam" />
          <Menu.Item leadingIcon={ICONS.REMOVE_BILISHAZAM} onPress={() => {}} title="Remove BiliShazam" />
          <Menu.Item leadingIcon={ICONS.ANALYTICS} onPress={() => {}} title="Analytics" />
          <Menu.Item leadingIcon={ICONS.REMOVE_BROKEN} onPress={() => {}} title="Remove Broken" />
          <Menu.Item leadingIcon={ICONS.RELOAD_BVIDS} onPress={() => {}} title="Reload Bvids" />
          <Menu.Item leadingIcon={ICONS.CLEAR} onPress={() => {}} title="Clear" />
          <Menu.Item leadingIcon={ICONS.REMOVE} onPress={() => {}} title="Remove" />
        </Menu>
  )
}