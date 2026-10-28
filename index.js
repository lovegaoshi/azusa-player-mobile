// import './wdyr'; // <--- first import
import { install } from 'react-native-nitro-base64';
import 'react-native-get-random-values';
import { AppRegistry } from 'react-native';
import TrackPlayer from 'react-native-track-player';
import 'react-native-gesture-handler';
import 'react-native-url-polyfill/auto';
import 'web-streams-polyfill/polyfill';

import App from './src/App';
import { PlaybackService } from './src/services';
import { name as appName } from './app.json';
import nodejs from '@utils/nodejs';
import llm from '@utils/ai/llm';

if (__DEV__) {
  import('./ReactotronConfig').then(() => console.log('Reactotron Configured'));
}
install();
llm();
AppRegistry.registerComponent(appName, () => App); // codePush(App));
nodejs?.start?.('main.js');
TrackPlayer.registerPlaybackService(() => PlaybackService);
