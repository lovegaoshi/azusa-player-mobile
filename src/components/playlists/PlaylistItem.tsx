import React, { ReactNode } from 'react';
import { StyleSheet, TouchableOpacity, View } from 'react-native';

import { useNoxSetting } from '@stores/useApp';
import { PaperText as Text } from '@components/commonui/ScaledText';
import { IconButton } from '../commonui/RNGHPaperWrapper';

const DefaultIcon = (
  item: NoxMedia.Playlist,
  deleteCallback: (id: string) => void,
) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

  return (
    <IconButton
      testID="playlist-item-delete-button"
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
  beginDrag?: () => void;
}
const PlaylistItem = ({
  item,
  icon,
  confirmOnDelete = () => undefined,
  leadColor,
  beginDrag,
}: PlaylistItemProps) => {
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);

  if (!item) return <></>;
  return (
    <View style={styles.playlistItemContainer}>
      <TouchableOpacity
        style={{ backgroundColor: leadColor, width: 15 }}
        onPressIn={beginDrag}
      />
      <View style={styles.playlistItemTextContainer}>
        <Text
          variant="bodyLarge"
          style={[
            {
              fontWeight:
                currentPlayingList.id === item?.id ? 'bold' : undefined,
              paddingHorizontal: 10,
            },
          ]}
        >
          {item.title}
        </Text>
      </View>
      <View style={styles.playlistItemIconContainer}>
        {icon ?? DefaultIcon(item, () => confirmOnDelete(item.id))}
      </View>
    </View>
  );
};

export default PlaylistItem;

const styles = StyleSheet.create({
  playlistItemContainer: {
    flexDirection: 'row',
  },
  playlistItemTextContainer: {
    flex: 4,
    justifyContent: 'center',
  },
  playlistItemIconContainer: { alignItems: 'flex-end' },
});
