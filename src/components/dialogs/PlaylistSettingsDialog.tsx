import React, { useState } from 'react';
import { KeyboardAvoidingView, View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Provider,
  Text,
  TextInput,
  Switch,
} from 'react-native-paper';
import Playlist from '../../objects/Playlist';
import { useNoxSetting } from '../../hooks/useSetting';

interface props {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: (newPlaylist: Playlist) => void;
}

export default ({
  visible,
  onClose = () => void 0,
  onSubmit = () => void 0,
}: props) => {
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const [playlistName, setPlaylistName] = useState(currentPlaylist.title);
  const [subscribeUrl, setSubscribeUrl] = useState('');
  const [blacklistedUrl, setBlacklistedUrl] = useState('');
  const [useBiliShazam, setUseBiliShazam] = useState(false);

  React.useEffect(() => {
    setPlaylistName(currentPlaylist.title);
    setSubscribeUrl(currentPlaylist.subscribeUrl.join(';'));
    setBlacklistedUrl(currentPlaylist.blacklistedUrl.join(';'));
    setUseBiliShazam(currentPlaylist.useBiliShazam);
  }, [currentPlaylist]);

  const toggleBiliShazam = () => setUseBiliShazam(val => !val);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    const newPlaylist: Playlist = {
      ...currentPlaylist,
      title: playlistName,
      subscribeUrl: Array.from(new Set(subscribeUrl.split(';'))),
      blacklistedUrl: Array.from(new Set(blacklistedUrl.split(';'))),
      useBiliShazam: useBiliShazam,
    };
    updatePlaylist(newPlaylist, [], []);
    onSubmit(newPlaylist);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <KeyboardAvoidingView style={{ minHeight: '10%' }}>
          <Dialog.Content>
            <TextInput
              label="Playlist Name"
              value={playlistName}
              onChangeText={(val: string) => setPlaylistName(val)}
            />
            <TextInput
              label="Subscribe URL"
              value={subscribeUrl}
              onChangeText={(val: string) => setSubscribeUrl(val)}
            />
            <TextInput
              label="Banned BVIDs"
              value={blacklistedUrl}
              onChangeText={(val: string) => setBlacklistedUrl(val)}
            />
            <View style={{ flexDirection: 'row' }}>
              <Switch value={useBiliShazam} onValueChange={toggleBiliShazam} />
              <Text style={{ fontSize: 18 }}>{'Use BiliShazam'}</Text>
            </View>
          </Dialog.Content>
        </KeyboardAvoidingView>

        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button onPress={handleSubmit}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
