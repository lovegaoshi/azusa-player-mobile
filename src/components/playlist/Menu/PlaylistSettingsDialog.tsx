import React, { useEffect } from 'react';
import { View, StyleSheet } from 'react-native';
import { Button, Dialog, Portal, Switch } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { useNoxSetting } from '@stores/useApp';
import NoxInput from '@components/dialogs/NoxInput';
import SplitInput from '@components/dialogs/SplitInput';
import usePlaylistSetting from './usePlaylistSetting';
import PlaylistRepeatMode from './PlaylistRepeatMode';
import { PaperText as Text } from '@components/commonui/ScaledText';

interface Props {
  visible: boolean;
  onClose?: () => void;
  playlist: NoxMedia.Playlist;
  onSubmit?: (newPlaylist: NoxMedia.Playlist) => void;
}

const PlaylistDialog = ({
  visible,
  onClose = () => undefined,
  onSubmit = () => undefined,
  playlist,
}: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [name, setName] = React.useState(playlist.title);
  const [sub, setSub] = React.useState(playlist.subscribeUrl.join(';'));
  const [blacklist, setBlacklist] = React.useState(
    playlist.blacklistedUrl.join(';'),
  );
  const {
    useBiliShazam,
    biliSync,
    newSongOverwrite,
    repeatMode,
    setRepeatMode,
    toggleBiliShazam,
    toggleBiliSync,
    toggleNewSongOverwrite,
    saveSetting,
  } = usePlaylistSetting(playlist);

  const initField = () => {
    setName(playlist.title);
    setSub(playlist.subscribeUrl.join(';'));
    setBlacklist(playlist.blacklistedUrl.join(';'));
  };

  const handleClose = () => {
    onClose();
    initField();
  };

  const handleSubmit = () => {
    const newSetting = {
      title: name,
      subscribeUrl: Array.from(new Set(sub.split(';'))),
      blacklistedUrl: Array.from(new Set(blacklist.split(';'))),
    };
    saveSetting(newSetting, onSubmit);
  };

  useEffect(() => initField(), [playlist.id]);

  return (
    <Dialog visible={visible} onDismiss={handleClose}>
      <Dialog.Content>
        <NoxInput
          label={t('PlaylistSettingsDialog.playlistNameLabel')}
          autofocus={false}
          selectTextOnFocus={false}
          text={name}
          setText={setName}
        />
        <SplitInput
          label={t('PlaylistSettingsDialog.subscribeUrlLabel')}
          text={sub}
          setText={setSub}
        />
        <NoxInput
          label={t('PlaylistSettingsDialog.blacklistedUrlLabel')}
          autofocus={false}
          selectTextOnFocus={false}
          text={blacklist}
          setText={setBlacklist}
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
            value={biliSync}
            onValueChange={toggleBiliSync}
            color={playerStyle.colors.onSurfaceVariant}
          />
          <Text style={styles.switchText}>
            {t('PlaylistSettingsDialog.useBiliSyncLabel')}
          </Text>
        </View>
        <View style={styles.switchContainer}>
          <Switch
            value={newSongOverwrite}
            onValueChange={toggleNewSongOverwrite}
            color={playerStyle.colors.onSurfaceVariant}
          />
          <Text style={styles.switchText}>
            {t('PlaylistSettingsDialog.useNewSongOverwriteLabel')}
          </Text>
        </View>
        <PlaylistRepeatMode onPress={setRepeatMode} mode={repeatMode} />
      </Dialog.Content>

      <Dialog.Actions>
        <Button onPress={handleClose}>{t('Dialog.cancel')}</Button>
        <Button onPress={handleSubmit}>{t('Dialog.ok')}</Button>
      </Dialog.Actions>
    </Dialog>
  );
};

export default function PlaylistSettingsDialogPortal(p: Props) {
  return (
    <Portal>
      <PlaylistDialog {...p} />
    </Portal>
  );
}

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  switchText: {
    fontSize: 18,
  },
});
