import { Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { randomChoice } from '../../utils/Utils';

export const localSplashes = [
  () => require('../../assets/splash/steria2.jpg'),
  () => require('../../assets/splash/abu-10k-subs.gif'),
  () => require('../../assets/splash/nox-3d.png'),
];
const randomSplashes = randomChoice(localSplashes);

const style = {
  flex: 1,
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width,
};

const AppOpenSplash = (props: any) => (
  <FastImage
    source={randomSplashes()}
    resizeMode={FastImage.resizeMode.contain}
    style={style}
    {...props}
  />
);

export default AppOpenSplash;
