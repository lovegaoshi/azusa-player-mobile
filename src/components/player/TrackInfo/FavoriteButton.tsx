import React, { useState, useEffect } from 'react';
import { IconButton } from 'react-native-paper';
import TrackPlayer, {
  Event,
  Track,
  useTrackPlayerEvents,
} from 'react-native-track-player';
import { useStore } from 'zustand';

import { useNoxSetting } from '@hooks/useSetting';
import { updatePlaylistSongs } from '@objects/Playlist';
import LottieButtonAnimated from '@components/buttons/LottieButtonAnimated';
import appStore from '@stores/appStore';
import { Platform } from 'react-native';
import logger from '@utils/Logger';

const getAppStoreState = appStore.getState;

interface Props {
  track?: Track;
}

export default ({ track }: Props) => {
  const song = track?.song as NoxMedia.Song;
  const favoritePlaylist = useNoxSetting(state => state.favoritePlaylist);
  const setFavoritePlaylist = useNoxSetting(state => state.setFavoritePlaylist);
  const [liked, setLiked] = useState(
    favoritePlaylist.songList.filter(val => val.id === song?.id).length > 0
  );
  const setRNTPOptions = useStore(appStore, state => state.setRNTPOptions);

  const onClick = () => {
    if (!song) return;
    if (liked) {
      setFavoritePlaylist(updatePlaylistSongs(favoritePlaylist, [], [song]));
    } else {
      setFavoritePlaylist(updatePlaylistSongs(favoritePlaylist, [song], []));
    }
    setLiked(!liked);
    setHeart(!liked);
  };

  const setHeart = (heart = false) => {
    if (Platform.OS === 'android') {
      const newRNTPOptions = {
        ...getAppStoreState().RNTPOptions,
        forwardIcon: heart
          ? require('@assets/icons/heart.png')
          : require('@assets/icons/heart-outline.png'),
      };
      TrackPlayer.updateOptions(newRNTPOptions);
      setRNTPOptions(newRNTPOptions);
    }
  };

  useTrackPlayerEvents([Event.RemoteJumpForward], () => {
    logger.log('[Event.RemoteJumpForward] button pressed.');
    onClick();
  });

  useEffect(() => {
    const liked =
      favoritePlaylist.songList.filter(val => val.id === song?.id).length > 0;
    setHeart(liked);
    setLiked(liked);
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
  return (
    <IconButton
      icon={liked ? 'cards-heart' : 'cards-heart-outline'}
      onPress={onClick}
      disabled={song === undefined}
      size={30}
    />
  );
};
