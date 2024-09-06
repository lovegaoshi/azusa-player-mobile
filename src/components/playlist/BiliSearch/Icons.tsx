import * as React from 'react';
import Svg, { Circle, Path, Polygon } from 'react-native-svg';
import { Image } from 'expo-image';
import { StyleSheet } from 'react-native';
import { Icon } from 'react-native-paper';

import { SearchOptions } from '@enums/Storage';

const Icons = {
  BILIBILI: () => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill="#20B0E3"
        d="M18.223 3.086a1.25 1.25 0 0 1 0 1.768L17.08 5.996h1.17A3.75 3.75 0 0 1 22 9.747v7.5a3.75 3.75 0 0 1-3.75 3.75H5.75A3.75 3.75 0 0 1 2 17.247v-7.5a3.75 3.75 0 0 1 3.75-3.75h1.166L5.775 4.855a1.25 1.25 0 1 1 1.767-1.768l2.652 2.652c.079.079.145.165.198.257h3.213c.053-.092.12-.18.199-.258l2.651-2.652a1.25 1.25 0 0 1 1.768 0zm.027 5.42H5.75a1.25 1.25 0 0 0-1.247 1.157l-.003.094v7.5c0 .659.51 1.199 1.157 1.246l.093.004h12.5a1.25 1.25 0 0 0 1.247-1.157l.003-.093v-7.5c0-.69-.56-1.25-1.25-1.25zm-10 2.5c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25zm7.5 0c.69 0 1.25.56 1.25 1.25v1.25a1.25 1.25 0 1 1-2.5 0v-1.25c0-.69.56-1.25 1.25-1.25z"
      ></Path>
    </Svg>
  ),
  YOUTUBE: () => (
    <Svg width={24} height={24} viewBox="-1 -3 18 18">
      <Path
        fill="#FF0000"
        d="M8.051 1.999h.089c.822.003 4.987.033 6.11.335a2.01 2.01 0 0 1 1.415 1.42c.101.38.172.883.22 1.402l.01.104.022.26.008.104c.065.914.073 1.77.074 1.957v.075c-.001.194-.01 1.108-.082 2.06l-.008.105-.009.104c-.05.572-.124 1.14-.235 1.558a2.01 2.01 0 0 1-1.415 1.42c-1.16.312-5.569.334-6.18.335h-.142c-.309 0-1.587-.006-2.927-.052l-.17-.006-.087-.004-.171-.007-.171-.007c-1.11-.049-2.167-.128-2.654-.26a2.01 2.01 0 0 1-1.415-1.419c-.111-.417-.185-.986-.235-1.558L.09 9.82l-.008-.104A31 31 0 0 1 0 7.68v-.123c.002-.215.01-.958.064-1.778l.007-.103.003-.052.008-.104.022-.26.01-.104c.048-.519.119-1.023.22-1.402a2.01 2.01 0 0 1 1.415-1.42c.487-.13 1.544-.21 2.654-.26l.17-.007.172-.006.086-.003.171-.007A100 100 0 0 1 7.858 2zM6.4 5.209v4.818l4.157-2.408z"
      />
    </Svg>
  ),
  YOUTUBEM: () => (
    // <svg xmlns="http://www.w3.org/2000/svg"  viewBox="0 0 48 48" width="48px" height="48px"><circle cx="24" cy="24" r="20" fill="#f44336"/><polygon fill="#fff" points="21,29 29,24 21,19"/><path fill="none" stroke="#fff" stroke-miterlimit="10" d="M24,14c5.5,0,10,4.476,10,10s-4.476,10-10,10	s-10-4.476-10-10S18.5,14,24,14"/></svg>
    <Svg width={24} height={24} viewBox="0 0 44 44">
      <Circle cx={24} cy={24} r={20} fill={'#f44336'} />
      <Polygon fill={'#fff'} points="21,29 29,24 21,19" />
      <Path
        fill="none"
        stroke={'#fff'}
        strokeMiterlimit={10}
        d="M24,14c5.5,0,10,4.476,10,10s-4.476,10-10,10	s-10-4.476-10-10S18.5,14,24,14"
      />
    </Svg>
  ),
  MUSICFREE: () => (
    <Image
      source={require('@assets/icons/musicfree.png')}
      style={style.musicFreeIcon}
    />
  ),
  LOCAL: (fill?: string) => (
    <Svg width={24} height={24} viewBox="0 0 24 24">
      <Path
        fill={fill}
        d="M17 3H5c-1.11 0-2 .9-2 2v14c0 1.1.89 2 2 2h14c1.1 0 2-.9 2-2V7l-4-4zm-5 16c-1.66 0-3-1.34-3-3s1.34-3 3-3 3 1.34 3 3-1.34 3-3 3zm3-10H5V5h10v4z"
      ></Path>
    </Svg>
  ),
};

export const getIcon = (icon: string) => {
  switch (icon) {
    case SearchOptions.BILIBILI:
      return Icons.BILIBILI;
    case SearchOptions.YOUTUBE:
      return Icons.YOUTUBE;
    case SearchOptions.YOUTUBEM:
      return Icons.YOUTUBEM;
    case SearchOptions.ALIST:
      return () => <Icon source={'google-cloud'} size={24} />;
    default:
      return Icons.MUSICFREE;
  }
};

export default Icons;

const style = StyleSheet.create({
  musicFreeIcon: { width: 40, height: 40, marginLeft: -5, marginTop: 4 },
});
