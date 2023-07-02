import { Dimensions } from 'react-native';
import FastImage from 'react-native-fast-image';
import { randomChoice } from '../../utils/Utils';

const randomSplashes = randomChoice([
  () => require('../../assets/splash/steria2.jpg'),
  () => require('../../assets/splash/abu-10k-subs.gif'),
  () => require('../../assets/splash/nox-3d.png'),
]);

const style = {
  flex: 1,
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width,
};

export default (props: any) => (
  <FastImage
    source={randomSplashes()}
    resizeMode={FastImage.resizeMode.contain}
    style={style}
    {...props}
  />
);
