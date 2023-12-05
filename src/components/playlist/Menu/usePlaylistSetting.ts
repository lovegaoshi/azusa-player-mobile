import { useState, useEffect } from 'react';
import { useNoxSetting } from '@stores/useApp';

export default (playlist: NoxMedia.Playlist) => {
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const [useBiliShazam, setUseBiliShazam] = useState(false);
  const [useBiliSync, setUseBiliSync] = useState(false);
  const [useNewSongOverwrite, setUseNewSongOverwrite] = useState(false);

  const toggleBiliShazam = () => setUseBiliShazam(val => !val);
  const toggleBiliSync = () => setUseBiliSync(val => !val);
  const toggleNewSongOverwrite = () => setUseNewSongOverwrite(val => !val);

  const saveSetting = (
    setting: Partial<NoxMedia.Playlist> = {},
    callback: (val: NoxMedia.Playlist) => void = () => undefined
  ) => {
    const updatedPlaylist = {
      ...playlist,
      useBiliShazam: useBiliShazam,
      biliSync: useBiliSync,
      newSongOverwrite: useNewSongOverwrite,
      ...setting,
    };
    updatePlaylist(updatedPlaylist);
    callback(updatedPlaylist);
  };

  useEffect(() => {
    setUseBiliShazam(playlist.useBiliShazam);
    setUseBiliSync(playlist.biliSync);
    setUseNewSongOverwrite(playlist.newSongOverwrite || false);
  }, [playlist]);

  return {
    useBiliShazam,
    useBiliSync,
    useNewSongOverwrite,
    toggleBiliShazam,
    toggleBiliSync,
    toggleNewSongOverwrite,
    saveSetting,
  };
};
