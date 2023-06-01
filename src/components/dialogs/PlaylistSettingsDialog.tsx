import React, { useState } from 'react';
import { View } from 'react-native';
import {
  Button,
  Dialog,
  Portal,
  Provider,
  Text,
  TextInput,
  Switch,
} from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '../../hooks/useSetting';
import PortaledInput from './PortaledInput';

interface props {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: (newPlaylist: NoxMedia.Playlist) => void;
}

export default ({
  visible,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: props) => {
  const { t } = useTranslation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const [useBiliShazam, setUseBiliShazam] = useState(false);
  const nameRef = React.useRef<any>();
  const subRef = React.useRef<any>();
  const blacklistRef = React.useRef<any>();

  React.useEffect(() => {
    setUseBiliShazam(currentPlaylist.useBiliShazam);
  }, [currentPlaylist]);

  const toggleBiliShazam = () => setUseBiliShazam(val => !val);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    const newPlaylist: NoxMedia.Playlist = {
      ...currentPlaylist,
      title: nameRef.current.name,
      subscribeUrl: Array.from(new Set(subRef.current.name.split(';'))),
      blacklistedUrl: Array.from(new Set(blacklistRef.current.name.split(';'))),
      useBiliShazam: useBiliShazam,
    };
    updatePlaylist(newPlaylist, [], []);
    onSubmit(newPlaylist);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Content>
          <PortaledInput
            handleSubmit={() => undefined}
            ref={nameRef}
            label={'RenameSongDialog.label'}
            defaultName={currentPlaylist.title}
            autofocus={false}
            selectTextOnFocus={false}
          />
          <PortaledInput
            handleSubmit={() => undefined}
            ref={subRef}
            label={'PlaylistSettingsDialog.subscribeUrlLabel'}
            defaultName={currentPlaylist.subscribeUrl.join(';')}
            autofocus={false}
            selectTextOnFocus={false}
          />
          <PortaledInput
            handleSubmit={() => undefined}
            ref={blacklistRef}
            label={'PlaylistSettingsDialog.blacklistedUrlLabel'}
            defaultName={currentPlaylist.blacklistedUrl.join(';')}
            autofocus={false}
            selectTextOnFocus={false}
          />
          <View style={{ flexDirection: 'row' }}>
            <Switch value={useBiliShazam} onValueChange={toggleBiliShazam} />
            <Text style={{ fontSize: 18 }}>
              {t('PlaylistSettingsDialog.useBiliShazamLabel')}
            </Text>
          </View>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleClose}>Cancel</Button>
          <Button onPress={handleSubmit}>Done</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};
