import { Dimensions, Pressable, StyleSheet, View } from 'react-native';
import { Image } from 'expo-image';
import Video from 'react-native-video';

import { randomChoice } from '@utils/Utils';
import useTanakaAmazingCommodities from '@hooks/useTanakaAmazingCommodities';

enum SplashType {
  Image = 'image',
  Video = 'video',
  Tanaka = 'tanaka',
}

type SplashArray = [SplashType, () => any][];

export const imageSplashes: SplashArray = [
  [SplashType.Image, () => require('@assets/splash/steria2.jpg')],
  [SplashType.Image, () => require('@assets/splash/abu-10k-subs.gif')],
  [SplashType.Image, () => require('@assets/splash/nox-3d.png')],
  [SplashType.Image, () => require('@assets/splash/nox-3d-2024.jpg')],
];

const localSplashes: SplashArray = [
  ...imageSplashes,
  [SplashType.Tanaka, () => require('@assets/splash/nox-3d.png')],
];

const randomSplash = randomChoice(localSplashes);

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
      volume={0.7}
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
  switch (randomSplash[0]) {
    case SplashType.Tanaka:
      if (!initialized) return <View />;
      if (tanaka) {
        return (
          <TanakaAmazingCommodities
            url={tanaka}
            onEnd={() => setIsSplashReady(true)}
          />
        );
      }
    // @eslint-disable-next-line no-fallthrough
    case SplashType.Image:
    default:
      setTimeout(() => setIsSplashReady(true), 1);
      return (
        <Image
          source={randomSplash[1]()}
          style={styles.fullscreen}
          contentFit={'contain'}
        />
      );
  }
};

export default AppOpenSplash;
