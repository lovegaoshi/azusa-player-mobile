import React, { useState } from 'react';
import { IconButton, Text, TouchableRipple } from 'react-native-paper';
import { Pressable, View, StyleSheet } from 'react-native';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';

import { useNoxSetting } from '@stores/useApp';
import { NoxRoutes } from '@enums/Routes';
import AddPlaylistButton from '../buttons/AddPlaylistButton';
import { StorageKeys } from '@enums/Storage';
import NewPlaylistDialog from '../dialogs/NewPlaylistDialog';
import useAlert from '../dialogs/useAlert';
import ShuffleAllButton from '@components/playlists/ShuffleAllButton';
import TimerButton from '@components/playlists/TimerButton';
import PlaylistItem from '@components/playlists/PlaylistItem';
import usePlaylistBrowseTree from '@hooks/usePlaylistBrowseTree';
import useNavigation from '@hooks/useNavigation';

interface NewButtonProps {
  setNewPlaylistDialogOpen: (v: boolean) => void;
}
const SearchPlaylistAsNewButton = ({
  setNewPlaylistDialogOpen,
}: NewButtonProps) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  return (
    <Pressable onPress={() => setNewPlaylistDialogOpen(true)}>
      <IconButton
        icon="new-box"
        size={25}
        iconColor={playerStyle.colors.primary}
      />
    </Pressable>
  );
};

export default () => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const navigation = useNavigation();
  const currentPlaylist = useNoxSetting(state => state.currentPlaylist);
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);
  const playlists = useNoxSetting(state => state.playlists);
  const playlistIds = useNoxSetting(state => state.playlistIds);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const playerSetting = useNoxSetting(state => state.playerSetting);
  const getPlaylist = useNoxSetting(state => state.getPlaylist);
  const setCurrentPlaylist = useNoxSetting(state => state.setCurrentPlaylist);
  const setPlaylistIds = useNoxSetting(state => state.setPlaylistIds);
  const scroll = useNoxSetting(state => state.incSongListScrollCounter);
  const { removePlaylist } = usePlaylistBrowseTree();
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
      () => removePlaylist(playlistId),
    );
  };

  const goToPlaylist = (playlistId: string) => {
    navigation.navigate({ route: NoxRoutes.PlayerHome });
    navigation.navigate({ route: NoxRoutes.Playlist });
    if (currentPlaylist.id === playlistId) {
      scroll();
    } else {
      getPlaylist(playlistId).then(p => {
        setCurrentPlaylist(p);
        scroll();
      });
    }
  };

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
                  ? (playerStyle.colors.primaryContainer ??
                    playerStyle.customColors.playlistDrawerBackgroundColor)
                  : undefined,
            },
          ]}
        >
          <PlaylistItem
            item={playlist}
            confirmOnDelete={confirmOnDelete}
            leadColor={
              currentPlayingList.id === item
                ? playerStyle.colors.primary
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
        onPress={() => setDialogOpen(true)}
      >
        <View style={styles.addPlaylistButtonContent}>
          <IconButton
            icon={'cards-heart'}
            onPress={() => goToPlaylist(StorageKeys.FAVORITE_PLAYLIST_KEY)}
            iconColor={playerStyle.colors.primary}
          />
          <ShuffleAllButton />
          <AddPlaylistButton open={dialogOpen} setOpen={setDialogOpen} />
          <TimerButton />
          <View style={styles.addPlaylistButtonSpacer} />
          {false && (
            <IconButton
              icon={'cog'}
              onPress={() => navigation.navigate({ route: NoxRoutes.Settings })}
            />
          )}
        </View>
      </TouchableRipple>
      <TouchableRipple
        onPress={() => goToPlaylist(StorageKeys.SEARCH_PLAYLIST_KEY)}
        style={[
          {
            backgroundColor:
              currentPlaylist.id ===
              playlists[StorageKeys.SEARCH_PLAYLIST_KEY]?.id
                ? (playerStyle.colors.primaryContainer ??
                  playerStyle.customColors.playlistDrawerBackgroundColor)
                : undefined,
          },
        ]}
      >
        <PlaylistItem
          item={playlists[StorageKeys.SEARCH_PLAYLIST_KEY]}
          icon={
            <SearchPlaylistAsNewButton
              setNewPlaylistDialogOpen={setNewPlaylistDialogOpen}
            />
          }
          leadColor={
            currentPlayingList.id ===
            playlists[StorageKeys.SEARCH_PLAYLIST_KEY].id
              ? playerStyle.colors.primary
              : undefined
          }
        />
      </TouchableRipple>
      <NewPlaylistDialog
        visible={newPlaylistDialogOpen}
        fromList={playlists[StorageKeys.SEARCH_PLAYLIST_KEY]}
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
