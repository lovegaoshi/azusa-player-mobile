// import './wdyr'; // <--- first import
import "react-native-get-random-values";
import { AppRegistry } from "react-native";
import TrackPlayer from "react-native-track-player";
import "react-native-gesture-handler";
import "react-native-url-polyfill/auto";
// import codePush from 'react-native-code-push';

import App from "./src/App";
import { PlaybackService } from "./src/services";
import { name as appName } from "./app.json";
import Share from "./src/components/share/Share";

if (__DEV__) {
  import("./ReactotronConfig").then(() => console.log("Reactotron Configured"));
}

AppRegistry.registerComponent(appName, () => App); // codePush(App));
AppRegistry.registerComponent("ShareMenuModuleComponent", () => Share);
TrackPlayer.registerPlaybackService(() => PlaybackService);
