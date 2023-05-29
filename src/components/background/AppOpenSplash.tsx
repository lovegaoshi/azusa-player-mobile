import { ImageBackground, Dimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import splash from '../../assets/splash';
import { randomChoice } from '../../utils/Utils';

const mobileHeight = Dimensions.get('window').height;
const mobileWidth = Dimensions.get('window').width;

export default (props: any) => (
  <FastImage
    source={require('../../assets/splash/steria.jpg')}
    resizeMode="cover"
    style={{ flex: 1, height: mobileHeight, width: mobileWidth }}
    {...props}
  />
);
