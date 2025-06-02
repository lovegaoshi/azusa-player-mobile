import * as React from 'react';

import { useNoxSetting } from '@stores/useApp';
import { UsePlaylistRN } from './usePlaylistRN';
import SongMenuSheet from '@components/playlist/SongList/SongMenuSheet';
import PlaylistMenuSheet from './Menu/PlaylistMenuSheet';

interface Props {
  usedPlaylist: UsePlaylistRN;
}

export default ({ usedPlaylist }: Props) => {
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const { setRows, playlistRef } = usedPlaylist;

  return (
    <React.Fragment>
      <SongMenuSheet
        usePlaylist={usedPlaylist}
        prepareForLayoutAnimationRender={() =>
          playlistRef.current?.prepareForLayoutAnimationRender()
        }
      />
      <PlaylistMenuSheet
        playlist={currentPlaylist}
        songListUpdateHalt={() => setRows([])}
      />
    </React.Fragment>
  );
};
