import { StackAnimationTypes } from 'react-native-screens';

import { isAndroid } from '@utils/RNUtils';

export default {
  animation: (isAndroid ? 'fade' : 'default') as StackAnimationTypes,
};
