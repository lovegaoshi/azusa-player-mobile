import React, { useState } from 'react';
import { IconButton, TouchableRipple } from 'react-native-paper';
import { Pressable, View, StyleSheet } from 'react-native';
import FlashDragList from 'react-native-flashdrag-list';
import { useDrawerProgress } from '@react-navigation/drawer';
import { DrawerNavigationHelpers } from '@react-navigation/drawer/lib/typescript/src/types';
import { scheduleOnRN } from 'react-native-worklets';
import { useAnimatedReaction } from 'react-native-reanimated';

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
import { useIsLandscape } from '@hooks/useOrientation';
import { PaperText as Text } from '@components/commonui/ScaledText';

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
        testID="search-playlist-as-new-playlist-button"
        icon="new-box"
        size={25}
        iconColor={playerStyle.colors.primary}
      />
    </Pressable>
  );
};

export default ({ navigation }: { navigation: DrawerNavigationHelpers }) => {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [drawerOpen, setDrawerOpen] = useState(false);
  const noxNavigation = useNavigation(navigation);
  const isLandscape = useIsLandscape();
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
  const progress = useDrawerProgress();

  useAnimatedReaction(
    () => progress.value,
    c => {
      scheduleOnRN(setDrawerOpen, c === 1);
    },
  );

  // HACK: tried to make searchList draweritem button as addPlaylistButton, but
  // dialog disposes on textinput focus. created a dialog directly in this component
  // instead and works fine.
  const [newPlaylistDialogOpen, setNewPlaylistDialogOpen] = useState(false);

  const confirmOnDelete = (playlistId: string) => {
    TwoWayAlert(
      `Delete ${playlists[playlistId]?.title ?? playlistId}?`,
      `Are you sure to delete playlist ${playlists[playlistId]?.title ?? playlistId}?`,
      () => removePlaylist(playlistId),
    );
  };

  const goToPlaylist = (playlistId: string) => {
    noxNavigation.navigate({
      route: isLandscape ? NoxRoutes.Playlist : NoxRoutes.PlayerHome,
      params: { screen: NoxRoutes.Playlist, pop: true },
    });
    if (currentPlaylist.id === playlistId) {
      scroll();
    } else {
      getPlaylist(playlistId).then(p => {
        setCurrentPlaylist(p);
        scroll();
      });
    }
  };

  const renderItem = (
    item: string,
    index: number,
    active: boolean,
    beginDrag: () => any,
  ) => {
    const playlist = playlists[item];
    return (
      <TouchableRipple
        key={index}
        onPress={() => goToPlaylist(item)}
        onLongPress={beginDrag}
        style={[
          {
            backgroundColor:
              currentPlaylist.id === item
                ? // this is a special high contrast color than primaryContainer.
                  (playerStyle.customColors.playlistDrawerBackgroundColor ??
                  playerStyle.colors.primaryContainer)
                : undefined,
          },
        ]}
      >
        <PlaylistItem
          beginDrag={beginDrag}
          item={playlist}
          confirmOnDelete={confirmOnDelete}
          leadColor={
            currentPlayingList.id === item
              ? playerStyle.colors.primary
              : undefined
          }
        />
      </TouchableRipple>
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
              onPress={() =>
                noxNavigation.navigate({ route: NoxRoutes.Settings })
              }
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
                ? // this is a special high contrast color than primaryContainer.
                  (playerStyle.customColors.playlistDrawerBackgroundColor ??
                  playerStyle.colors.primaryContainer)
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
      <FlashDragList
        loaded={drawerOpen}
        data={playlistIds}
        renderItem={renderItem}
        itemsSize={53}
        onSort={(fromIndex, toIndex) => {
          const copy = [...playlistIds];
          const removed = copy.splice(fromIndex, 1);
          copy.splice(toIndex, 0, removed[0]!);
          setPlaylistIds(copy);
        }}
        extraData={[
          currentPlaylist.id,
          currentPlayingList.id,
          currentPlaylist.title,
          playerStyle,
        ]}
      />
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
  bottomInfo: {
    paddingBottom: 10,
  },
  bottomInfoText: {
    textAlign: 'center',
  },
  drawerItemContainer: { flexDirection: 'row' },
  drawerItemTextContainer: { justifyContent: 'center' },
});
