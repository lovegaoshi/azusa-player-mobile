import { ImageBackground, Dimensions, View } from 'react-native';
import FastImage from 'react-native-fast-image';
import splash from '../../assets/splash';
import { randomChoice } from '../../utils/Utils';

const style = {
  flex: 1,
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width,
};

export default (props: any) => (
  <FastImage
    source={require('../../assets/splash/steria.jpg')}
    resizeMode="cover"
    style={style}
    {...props}
  />
);
