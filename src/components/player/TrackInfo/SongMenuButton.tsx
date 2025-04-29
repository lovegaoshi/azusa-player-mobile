import React from 'react';
import { IconButton } from 'react-native-paper';
import { TrueSheet } from '@lodev09/react-native-true-sheet';

import { useNoxSetting } from '@stores/useApp';
import { NoxRoutes } from '@enums/Routes';

export default ({ track }: NoxComponent.TrackProps) => {
  const song = track?.song as NoxMedia.Song;
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const handlePress = () => {
    TrueSheet.present(NoxRoutes.SongMenuSheet);
  };

  return (
    <IconButton
      icon="dots-vertical"
      size={30}
      onPress={handlePress}
      disabled={song === undefined}
      theme={{ colors: { onSurfaceVariant: playerStyle.colors.primary } }}
    />
  );
};
