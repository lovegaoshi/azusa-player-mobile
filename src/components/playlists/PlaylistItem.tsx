import React, { ReactNode } from "react";
import { IconButton, Text } from "react-native-paper";
import { StyleSheet, View } from "react-native";

import { useNoxSetting } from "@stores/useApp";

const DefaultIcon = (
  item: NoxMedia.Playlist,
  deleteCallback: (id: string) => void,
) => {
  const playerStyle = useNoxSetting((state) => state.playerStyle);

  return (
    <IconButton
      icon="close"
      onPress={() => deleteCallback(item.id)}
      size={25}
      iconColor={playerStyle.colors.primary}
    />
  );
};

interface PlaylistItemProps {
  item: NoxMedia.Playlist;
  icon?: ReactNode;
  confirmOnDelete?: (id: string) => void;
  leadColor?: string;
}
const PlaylistItem = ({
  item,
  icon,
  confirmOnDelete = () => undefined,
  leadColor,
}: PlaylistItemProps) => {
  const currentPlayingList = useNoxSetting((state) => state.currentPlayingList);

  if (!item) return <></>;
  return (
    <View style={styles.playlistItemContainer}>
      <View style={{ backgroundColor: leadColor, width: 15 }}></View>
      <View style={styles.playlistItemTextContainer}>
        <Text
          variant="bodyLarge"
          style={[
            {
              fontWeight:
                currentPlayingList.id === item?.id ? "bold" : undefined,
              paddingHorizontal: 10,
            },
          ]}
        >
          {item.title}
        </Text>
      </View>
      <View style={styles.playlistItemIconContainer}>
        {icon ? icon : DefaultIcon(item, () => confirmOnDelete(item.id))}
      </View>
    </View>
  );
};

export default PlaylistItem;

const styles = StyleSheet.create({
  playlistItemContainer: {
    flexDirection: "row",
  },
  playlistItemTextContainer: {
    flex: 4,
    justifyContent: "center",
  },
  playlistItemIconContainer: { alignItems: "flex-end" },
});
