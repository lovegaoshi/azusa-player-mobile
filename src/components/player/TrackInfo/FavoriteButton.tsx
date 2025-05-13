import React, { useState, useEffect } from 'react';
import TrackPlayer, {
  Event,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { useStore } from 'zustand';

import LottieButtonAnimated from '@components/buttons/LottieButtonAnimated';
import appStore from '@stores/appStore';
import logger from '@utils/Logger';
import { isAndroid } from '@utils/RNUtils';
import { getFavContainSong } from '@utils/db/sqlStorage';

const getAppStoreState = appStore.getState;

export default ({ track }: NoxComponent.TrackProps) => {
  const song = track?.song as NoxMedia.Song;
  const [liked, setLiked] = useState(false);
  const setRNTPOptions = useStore(appStore, state => state.setRNTPOptions);

  const onClick = async () => {
    if (!song) return;
    if (liked) {
      await getFavContainSong({ song, remove: true });
    } else {
      await getFavContainSong({ song, add: true });
    }
    setLiked(!liked);
    setHeart(!liked);
  };

  const setHeart = (heart = false) => {
    if (isAndroid) {
      const oldOptions = getAppStoreState().RNTPOptions;
      const newRNTPOptions = {
        ...oldOptions,
        customActions: oldOptions?.customActions
          ? {
              ...oldOptions!.customActions!,
              customFavorite: heart ? 1 : 0,
            }
          : undefined,
      };
      TrackPlayer.updateOptions(newRNTPOptions);
      setRNTPOptions(newRNTPOptions);
    }
  };

  useTrackPlayerEvents(isAndroid ? [Event.RemoteCustomAction] : [], e => {
    if (e.customAction !== 'customFavorite') return;
    logger.log('[Event.CustomAction] fav button pressed.');
    onClick();
  });

  useEffect(() => {
    getFavContainSong({ song }).then(liked => {
      setHeart(liked);
      setLiked(liked);
    });
  }, [track]);

  return (
    <LottieButtonAnimated
      src={require('@assets/lottie/Heart.json')}
      size={30}
      onPress={onClick}
      clicked={liked}
      clickedLottieProgress={0.5}
      strokes={['Rays 2', 'Fill 2', 'Heart Outlines 2']}
      duration={500}
      pressableStyle={{ backgroundColor: undefined }}
    />
  );
};
