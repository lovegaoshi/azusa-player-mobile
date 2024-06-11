import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';

import { randomChoice } from '@utils/Utils';
import useTanakaAmazingCommodities from '@hooks/useTanakaAmazingCommodities';
import Video from 'react-native-video';

enum SplashType {
  Image = 'image',
  Video = 'video',
  Tanaka = 'tanaka',
}

const localSplashes: [SplashType, () => any][] = [
  [SplashType.Image, () => require('@assets/splash/steria2.jpg')],
  [SplashType.Image, () => require('@assets/splash/abu-10k-subs.gif')],
  [SplashType.Image, () => require('@assets/splash/nox-3d.png')],
  [SplashType.Tanaka, () => require('@assets/splash/nox-3d.png')],
];

export const imageSplashes = localSplashes.filter(
  ([t]) => t === SplashType.Image
);

const randomSplashes = randomChoice(localSplashes);

const fullScreenStyle = {
  flex: 1,
  height: Dimensions.get('window').height,
  width: Dimensions.get('window').width,
};

const styles = StyleSheet.create({
  fullscreen: fullScreenStyle,
  tanaka: {
    ...fullScreenStyle,
    position: 'absolute',
  },
});

interface TanakaProps {
  url: string;
  onEnd?: () => void;
}
const TanakaAmazingCommodities = ({ url, onEnd }: TanakaProps) => (
  <>
    <Video
      source={{
        uri: url,
      }}
      style={styles.tanaka}
      onEnd={onEnd}
      repeat={false}
      resizeMode="cover"
      disableFocus={true}
      preventsDisplaySleepDuringVideoPlayback={false}
    />
    <Pressable style={styles.fullscreen} onPress={onEnd} />
  </>
);

interface Props {
  setIsSplashReady: (v: boolean) => void;
}
const AppOpenSplash = ({ setIsSplashReady }: Props) => {
  const { tanaka, initialized } = useTanakaAmazingCommodities();
  switch (randomSplashes[0]) {
    case SplashType.Tanaka:
      if (!initialized) {
        return <View />;
      } else if (tanaka) {
        return (
          <TanakaAmazingCommodities
            url={tanaka}
            onEnd={() => setIsSplashReady(true)}
          />
        );
      }
    case SplashType.Image:
    default:
      setTimeout(() => setIsSplashReady(true), 1);
      return <Image source={randomSplashes[1]()} style={styles.fullscreen} />;
  }
};

export default AppOpenSplash;
