import React, { useState, useEffect } from 'react';
import { IconButton } from 'react-native-paper';
import { Track } from 'react-native-track-player';

import { useNoxSetting } from '../../../hooks/useSetting';
import { updatePlaylistSongs } from '../../../objects/Playlist';

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
    <IconButton
      icon={liked ? 'cards-heart' : 'cards-heart-outline'}
      onPress={onClick}
      disabled={song === undefined}
      size={30}
    />
  );
};
