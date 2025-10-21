import React from 'react';
import { Dimensions, Pressable, View } from 'react-native';
import { Image } from 'expo-image';
import Video from 'react-native-video';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import { randomChoice } from '@utils/Utils';
import useTanakaAmazingCommodities from '@hooks/useTanakaAmazingCommodities';
import useAlert from '../dialogs/useAlert';
import { clearStorage } from '@utils/ChromeStorageAPI';

enum SplashType {
  Image = 'image',
  Video = 'video',
  Tanaka = 'tanaka',
}

type SplashArray = [SplashType, () => unknown][];

export const imageSplashes: SplashArray = [
  [SplashType.Image, () => require('@assets/splash/steria2.jpg')],
  [SplashType.Image, () => require('@assets/splash/nox-3d.jpg')],
  [SplashType.Image, () => require('@assets/splash/nox-3d-2024.jpg')],
];

const localSplashes: SplashArray = [
  ...imageSplashes,
  [SplashType.Tanaka, () => require('@assets/splash/nox-3d.jpg')],
];

const randomSplash = randomChoice(localSplashes);

interface TanakaProps {
  url: string;
  onEnd?: () => void;
}
const TanakaAmazingCommodities = ({ url, onEnd }: TanakaProps) => {
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const fullScreenStyle = {
    width,
    height: height + insets.top + insets.bottom,
    flex: 1,
  };

  return (
    <>
      <Video
        source={{
          uri: url,
        }}
        volume={0.7}
        style={[{ position: 'absolute' }, fullScreenStyle]}
        onEnd={onEnd}
        repeat={false}
        resizeMode="cover"
        disableFocus={true}
        preventsDisplaySleepDuringVideoPlayback={false}
        controls={false}
      />
      <Pressable style={fullScreenStyle} onPress={onEnd} />
    </>
  );
};

interface Props {
  setIsSplashReady: (v: boolean) => void;
}
const AppOpenSplash = ({ setIsSplashReady }: Props) => {
  const { tanaka, initialized } = useTanakaAmazingCommodities();
  const { width, height } = Dimensions.get('window');
  const insets = useSafeAreaInsets();
  const fullScreenStyle = {
    width,
    height: height + insets.top + insets.bottom,
    flex: 1,
  };

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
          source={randomSplash[1]() as number}
          style={fullScreenStyle}
          contentFit={'contain'}
        />
      );
  }
};

export default function AppOpenSplashView(p: Props) {
  const pressingCount = React.useRef(0);
  const { TwoWayAlert } = useAlert();

  return (
    <Pressable
      onPress={() => {
        pressingCount.current++;
        if (pressingCount.current > 5) {
          TwoWayAlert('Reset', 'Are you sure to reset the app?', clearStorage);
        }
      }}
    >
      <AppOpenSplash {...p} />
    </Pressable>
  );
}
