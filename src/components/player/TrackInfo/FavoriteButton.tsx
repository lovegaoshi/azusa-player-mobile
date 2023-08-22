import React, { useState, useEffect } from 'react';
import { IconButton } from 'react-native-paper';
import { Track } from 'react-native-track-player';

import { useNoxSetting } from '@hooks/useSetting';
import { updatePlaylistSongs } from '@objects/Playlist';
import LottieButtonAnimated from '@components/buttons/LottieButtonAnimated';

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

  const onClick = () => {
    if (!song) return;
    if (liked) {
      setLiked(false);
      setFavoritePlaylist(updatePlaylistSongs(favoritePlaylist, [], [song]));
    } else {
      setLiked(true);
      setFavoritePlaylist(updatePlaylistSongs(favoritePlaylist, [song], []));
    }
  };

  useEffect(
    () =>
      setLiked(
        favoritePlaylist.songList.filter(val => val.id === song?.id).length > 0
      ),
    [track]
  );

  return (
    <LottieButtonAnimated
      src={require('@assets/lottie/Heart.json')}
      size={30}
      onPressClicked={onClick}
      onPressNotClicked={onClick}
      clicked={liked}
      clickedLottieProgress={0.5}
      strokes={['Rays 2', 'Fill 2', 'Heart Outlines 2']}
      duration={500}
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
