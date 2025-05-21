import { useState, useEffect } from 'react';
import { useNoxSetting } from '@stores/useApp';

export default (playlist: NoxMedia.Playlist) => {
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);

  const [subscribeUrl, setSubscribeUrl] = useState('');
  const [blacklistedUrl, setBlacklistedUrl] = useState('');
  const [title, setTitle] = useState('');
  const [useBiliShazam, setUseBiliShazam] = useState(false);
  const [biliSync, setBiliSync] = useState(false);
  const [newSongOverwrite, setNewSongOverwrite] = useState(false);
  const [repeatMode, setRepeatMode] = useState(playlist.repeatMode);

  const toggleBiliShazam = () => setUseBiliShazam(val => !val);
  const toggleBiliSync = () => setBiliSync(val => !val);
  const toggleNewSongOverwrite = () => setNewSongOverwrite(val => !val);

  const saveSetting = (
    setting: Partial<NoxMedia.Playlist> = {},
    callback: (val: NoxMedia.Playlist) => void = () => undefined,
  ) => {
    const updatedPlaylist = {
      ...playlist,
      title,
      subscribeUrl: subscribeUrl.split(';'),
      blacklistedUrl: blacklistedUrl.split(';'),
      useBiliShazam: useBiliShazam,
      biliSync,
      newSongOverwrite,
      repeatMode,
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
    setBiliSync(playlist.biliSync);
    setNewSongOverwrite(playlist.newSongOverwrite ?? false);
    setRepeatMode(playlist.repeatMode);
  };

  useEffect(loadSetting, [playlist]);

  return {
    subscribeUrl,
    setSubscribeUrl,
    blacklistedUrl,
    setBlacklistedUrl,
    title,
    setTitle,
    useBiliShazam,
    biliSync,
    newSongOverwrite,
    toggleBiliShazam,
    toggleBiliSync,
    toggleNewSongOverwrite,
    repeatMode,
    setRepeatMode,
    saveSetting,
    loadSetting,
  };
};
