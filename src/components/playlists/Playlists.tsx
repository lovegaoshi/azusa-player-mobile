import React, { useRef, useState } from 'react';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';
import { useNavigation } from '@react-navigation/native';
import { Pressable, View, StyleSheet } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';

import { useNoxSetting } from '@stores/useApp';
import AddPlaylistButton, {
  AddPlaylistButtonRef,
} from '../buttons/AddPlaylistButton';
import { STORAGE_KEYS } from '@enums/Storage';
import NewPlaylistDialog from '../dialogs/NewPlaylistDialog';
import useAlert from '../dialogs/useAlert';
import ShuffleAllButton from '@components/playlists/ShuffleAllButton';
import TimerButton from '@components/playlists/TimerButton';
import PlaylistItem from '@components/playlists/PlaylistItem';
import usePlaylistAA from '@hooks/usePlaylistAA';

export default () => {
  const navigation = useNavigation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const addPlaylistButtonRef = useRef<AddPlaylistButtonRef>(null);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const setPlaylistIds = useNoxSetting(state => state.setPlaylistIds);
  const { removePlaylist } = usePlaylistAA();
  const { TwoWayAlert } = useAlert();
  // HACK: I know its bad! But somehow this hook isnt updating in its own
  // useEffects...

  // HACK: tried to make searchList draweritem button as addPlaylistButton, but
  // dialog disposes on textinput focus. created a dialog directly in this component
  // instead and works fine.
  const [newPlaylistDialogOpen, setNewPlaylistDialogOpen] = useState(false);

  const confirmOnDelete = (playlistId: string) => {
    TwoWayAlert(
      `Delete ${playlists[playlistId].title}?`,
      `Are you sure to delete playlist ${playlists[playlistId].title}?`,
      () => removePlaylist(playlistId)
    );
  };

  const goToPlaylist = (playlistId: string) => {
    setCurrentPlaylist(playlists[playlistId]);
    navigation.navigate(NoxEnum.View.View.PLAYER_PLAYLIST as never);
  };

  const SearchPlaylistAsNewButton = () => (
    <Pressable onPress={() => setNewPlaylistDialogOpen(true)}>
      <IconButton
        icon="new-box"
        size={25}
        iconColor={playerStyle.colors.primary}
      />
    </Pressable>
  );

  const renderItem = ({ item, drag, isActive }: RenderItemParams<string>) => {
    const playlist = playlists[item];
    return (
      <ScaleDecorator>
        <TouchableRipple
          onLongPress={drag}
          disabled={isActive}
          onPress={() => goToPlaylist(item)}
          style={[
            {
              backgroundColor:
                currentPlaylist.id === item
                  ? playerStyle.customColors.playlistDrawerBackgroundColor
                  : undefined,
            },
          ]}
        >
          <PlaylistItem
            item={playlist}
            confirmOnDelete={confirmOnDelete}
            leadColor={
              currentPlayingList.id === item
                ? playerStyle.colors.primary //customColors.playlistDrawerBackgroundColor
                : undefined
            }
          />
        </TouchableRipple>
      </ScaleDecorator>
    );
  };

  return (
    <View style={styles.flexContainer}>
      <TouchableRipple
        style={styles.addPlaylistButtonContainer}
        onPress={
          // HACK: tooo lazy to lift this state up...
          addPlaylistButtonRef.current
            ? () => addPlaylistButtonRef.current!.setOpen()
            : () => undefined
        }
      >
        <View style={styles.addPlaylistButtonContent}>
          <IconButton
            icon={'cards-heart'}
            onPress={() => goToPlaylist(STORAGE_KEYS.FAVORITE_PLAYLIST_KEY)}
          />
          <ShuffleAllButton />
          <AddPlaylistButton ref={addPlaylistButtonRef} />
          <TimerButton />
          <View style={styles.addPlaylistButtonSpacer} />
          {false && (
            <IconButton
              icon={'cog'}
              onPress={() =>
                navigation.navigate(NoxEnum.View.View.SETTINGS as never)
              }
            />
          )}
        </View>
      </TouchableRipple>
      <TouchableRipple
        onPress={() => goToPlaylist(STORAGE_KEYS.SEARCH_PLAYLIST_KEY)}
        style={[
          {
            backgroundColor:
              currentPlaylist.id ===
              playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY]?.id
                ? playerStyle.customColors.playlistDrawerBackgroundColor
                : undefined,
          },
        ]}
      >
        <PlaylistItem
          item={playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY]}
          icon={SearchPlaylistAsNewButton()}
          leadColor={
            currentPlayingList.id ===
            playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY].id
              ? playerStyle.colors.primary //customColors.playlistDrawerBackgroundColor
              : undefined
          }
        />
      </TouchableRipple>
      <NewPlaylistDialog
        visible={newPlaylistDialogOpen}
        fromList={playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY]}
        onClose={() => setNewPlaylistDialogOpen(false)}
        onSubmit={() => setNewPlaylistDialogOpen(false)}
      />
      <View style={{ flex: 1 }}>
        <DraggableFlatList
          style={[styles.draggableFlatList]}
          data={playlistIds}
          onDragEnd={({ data }) => setPlaylistIds(data)}
          keyExtractor={item => item}
          renderItem={renderItem}
        />
      </View>
      <View style={styles.bottomInfo}>
        <Text style={styles.bottomInfoText}>
          {`${playerStyle.metaData.themeName} @ ${playerSetting.noxVersion}`}
        </Text>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  flexContainer: {
    flex: 1,
  },
  topPadding: {
    height: 10,
  },
  addPlaylistButtonContainer: {
    height: 50,
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaylistButtonContent: {
    flexDirection: 'row',
    alignContent: 'center',
    alignItems: 'center',
    justifyContent: 'center',
  },
  addPlaylistButtonSpacer: {
    width: 40,
    height: 40,
  },
  draggableFlatList: {},
  bottomInfo: {
    paddingBottom: 20,
  },
  bottomInfoText: {
    textAlign: 'center',
  },
  drawerItemContainer: { flexDirection: 'row' },
  drawerItemTextContainer: { justifyContent: 'center' },
});
