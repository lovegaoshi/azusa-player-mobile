import { useState, useEffect } from 'react';
import { useNoxSetting } from '@stores/useApp';

export default (playlist: NoxMedia.Playlist) => {
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const [subscribeUrl, setSubscribeUrl] = useState('');
  const [blacklistedUrl, setBlacklistedUrl] = useState('');
  const [title, setTitle] = useState('');
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
      title,
      subscribeUrl: subscribeUrl.split(';'),
      blacklistedUrl: blacklistedUrl.split(';'),
      useBiliShazam: useBiliShazam,
      biliSync: useBiliSync,
      newSongOverwrite: useNewSongOverwrite,
      ...setting,
    };
    updatePlaylist(updatedPlaylist);
    callback(updatedPlaylist);
  };

  const loadSetting = () => {
    setSubscribeUrl(playlist.subscribeUrl.join(';'));
    setBlacklistedUrl(playlist.blacklistedUrl.join(';'));
    setTitle(playlist.title);
    setUseBiliShazam(playlist.useBiliShazam);
    setUseBiliSync(playlist.biliSync);
    setUseNewSongOverwrite(playlist.newSongOverwrite || false);
  };

  useEffect(loadSetting, [playlist]);

  return {
    useBiliShazam,
    useBiliSync,
    useNewSongOverwrite,
    toggleBiliShazam,
    toggleBiliSync,
    toggleNewSongOverwrite,
    saveSetting,
    loadSetting,
  };
};
