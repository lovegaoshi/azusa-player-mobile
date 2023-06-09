import React, { useState, useRef, useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
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

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
  },
  switchText: {
    fontSize: 18,
  },
});

interface Props {
  visible: boolean;
  onClose?: () => void;
  onSubmit?: (newPlaylist: NoxMedia.Playlist) => void;
}

export default ({
  visible,
  onClose = () => undefined,
  onSubmit = () => undefined,
}: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const updatePlaylist = useNoxSetting(state => state.updatePlaylist);
  const [useBiliShazam, setUseBiliShazam] = useState(false);
  const [useBiliSync, setUseBiliSync] = useState(false);
  const nameRef = useRef<any>();
  const subRef = useRef<any>();
  const blacklistRef = useRef<any>();

  useEffect(() => {
    setUseBiliShazam(currentPlaylist.useBiliShazam);
    setUseBiliSync(currentPlaylist.biliSync);
  }, [currentPlaylist]);

  const toggleBiliShazam = () => setUseBiliShazam(val => !val);
  const toggleBiliSync = () => setUseBiliSync(val => !val);

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
          <View style={styles.switchContainer}>
            <Switch
              value={useBiliShazam}
              onValueChange={toggleBiliShazam}
              color={playerStyle.colors.onSurfaceVariant}
            />
            <Text style={styles.switchText}>
              {t('PlaylistSettingsDialog.useBiliShazamLabel')}
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <Switch
              value={useBiliSync}
              onValueChange={toggleBiliSync}
              color={playerStyle.colors.onSurfaceVariant}
            />
            <Text style={styles.switchText}>
              {t('PlaylistSettingsDialog.useBiliSyncLabel')}
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
