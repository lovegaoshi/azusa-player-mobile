import React, { useRef } from "react";
import { View, StyleSheet } from "react-native";
import { Button, Dialog, Portal, Text, Switch } from "react-native-paper";
import { useTranslation } from "react-i18next";

import { useNoxSetting } from "@stores/useApp";
import PortaledInput, {
  PortalInputRef,
} from "@components/dialogs/PortaledInput";
import usePlaylistSetting from "./usePlaylistSetting";

interface Props {
  visible: boolean;
  onClose?: () => void;
  playlist: NoxMedia.Playlist;
  onSubmit?: (newPlaylist: NoxMedia.Playlist) => void;
}

export default ({
  visible,
  onClose = () => undefined,
  onSubmit = () => undefined,
  playlist,
}: Props) => {
  const { t } = useTranslation();
  const playerStyle = useNoxSetting((state) => state.playerStyle);
  const nameRef = useRef<PortalInputRef>();
  const subRef = useRef<PortalInputRef>();
  const blacklistRef = useRef<PortalInputRef>();
  const {
    useBiliShazam,
    useBiliSync,
    useNewSongOverwrite,
    toggleBiliShazam,
    toggleBiliSync,
    toggleNewSongOverwrite,
    saveSetting,
  } = usePlaylistSetting(playlist);

  const handleClose = () => {
    onClose();
  };

  const handleSubmit = () => {
    const newSetting = {
      title: nameRef.current?.name || "",
      subscribeUrl: Array.from(new Set(subRef.current?.name.split(";"))),
      blacklistedUrl: Array.from(
        new Set(blacklistRef.current?.name.split(";")),
      ),
    };
    saveSetting(newSetting, onSubmit);
  };

  return (
    <Portal>
      <Dialog visible={visible} onDismiss={handleClose}>
        <Dialog.Content>
          <PortaledInput
            ref={nameRef}
            label={"RenameSongDialog.label"}
            defaultName={playlist.title}
            autofocus={false}
            selectTextOnFocus={false}
          />
          <PortaledInput
            ref={subRef}
            label={"PlaylistSettingsDialog.subscribeUrlLabel"}
            defaultName={playlist.subscribeUrl.join(";")}
            autofocus={false}
            selectTextOnFocus={false}
          />
          <PortaledInput
            ref={blacklistRef}
            label={"PlaylistSettingsDialog.blacklistedUrlLabel"}
            defaultName={playlist.blacklistedUrl.join(";")}
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
              {t("PlaylistSettingsDialog.useBiliShazamLabel")}
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <Switch
              value={useBiliSync}
              onValueChange={toggleBiliSync}
              color={playerStyle.colors.onSurfaceVariant}
            />
            <Text style={styles.switchText}>
              {t("PlaylistSettingsDialog.useBiliSyncLabel")}
            </Text>
          </View>
          <View style={styles.switchContainer}>
            <Switch
              value={useNewSongOverwrite}
              onValueChange={toggleNewSongOverwrite}
              color={playerStyle.colors.onSurfaceVariant}
            />
            <Text style={styles.switchText}>
              {t("PlaylistSettingsDialog.useNewSongOverwriteLabel")}
            </Text>
          </View>
        </Dialog.Content>

        <Dialog.Actions>
          <Button onPress={handleClose}>{t("Dialog.cancel")}</Button>
          <Button onPress={handleSubmit}>{t("Dialog.ok")}</Button>
        </Dialog.Actions>
      </Dialog>
    </Portal>
  );
};

const styles = StyleSheet.create({
  switchContainer: {
    flexDirection: "row",
  },
  switchText: {
    fontSize: 18,
  },
});
