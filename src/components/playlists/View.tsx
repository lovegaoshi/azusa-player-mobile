import React, { ReactNode, useRef, useState, useEffect } from 'react';
import { IconButton, Divider, Text, TouchableRipple } from 'react-native-paper';
import { DrawerActions, useNavigation } from '@react-navigation/native';
import {
  Pressable,
  Dimensions,
  View,
  ImageBackground,
  StyleSheet,
  Linking,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import DraggableFlatList, {
  ScaleDecorator,
  RenderItemParams,
} from 'react-native-draggable-flatlist';
import { useStore } from 'zustand';

import { useNoxSetting } from '@hooks/useSetting';
import useAAPlayback from '@hooks/useAAPlayback';
import { ViewEnum } from '@enums/View';
import AddPlaylistButton, {
  AddPlaylistButtonRef,
} from '../buttons/AddPlaylistButton';
import { STORAGE_KEYS } from '@enums/Storage';
import NewPlaylistDialog from '../dialogs/NewPlaylistDialog';
import useAlert from '../dialogs/useAlert';
import ShuffleAllButton from './ShuffleAllButton';
import TimerButton from './TimerButton';
import appStore from '@stores/appStore';
import logger from '@utils/Logger';
import useTheme from '@hooks/useTheme';

const useRenderDrawerItem = () => {
  const navigation = useNavigation();
  const { t } = useTranslation();

  return ({
    view,
    icon,
    text,
  }: {
    view: string;
    icon: string;
    text: string;
  }) => (
    <TouchableRipple onPress={() => navigation.navigate(view as never)}>
      <View style={styles.drawerItemContainer}>
        <IconButton icon={icon} size={32} />
        <View style={styles.drawerItemTextContainer}>
          <Text variant="titleLarge">{t(text)}</Text>
        </View>
      </View>
    </TouchableRipple>
  );
};

const DefaultIcon = (
  item: NoxMedia.Playlist,
  deleteCallback: (id: string) => void
) => {
  const playerStyle = useNoxSetting(state => state.playerStyle);

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
  const currentPlayingList = useNoxSetting(state => state.currentPlayingList);

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
                currentPlayingList.id === item?.id ? 'bold' : undefined,
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

const BiliCard = (props: any) => {
  if (props.backgroundURI) {
    return (
      <ImageBackground source={{ uri: props.backgroundURI }}>
        {props.children}
      </ImageBackground>
    );
  }
  return <>{props.children}</>;
};

export default (props: any) => {
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
  const removePlaylist = useNoxSetting(state => state.removePlaylist);
  const RenderDrawerItem = useRenderDrawerItem();
  const { TwoWayAlert } = useAlert();
  // HACK: I know its bad! But somehow this hook isnt updating in its own
  // useEffects...
  const { buildBrowseTree } = useAAPlayback();
  const usedTheme = useTheme();
  const PIPMode = useStore(appStore, state => state.pipMode);

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
    navigation.navigate(ViewEnum.PLAYER_PLAYLIST as never);
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

  const renderItem = ({
    item,
    drag,
    isActive,
  }: RenderItemParams<NoxMedia.Playlist>) => {
    return (
      <ScaleDecorator>
        <TouchableRipple
          onLongPress={drag}
          disabled={isActive}
          onPress={() => goToPlaylist(item.id)}
          style={[
            {
              backgroundColor:
                currentPlaylist.id === item?.id
                  ? playerStyle.customColors.playlistDrawerBackgroundColor
                  : undefined,
            },
          ]}
        >
          <PlaylistItem
            item={item}
            confirmOnDelete={confirmOnDelete}
            leadColor={
              currentPlayingList.id === item?.id
                ? playerStyle.customColors.playlistDrawerBackgroundColor
                : undefined
            }
          />
        </TouchableRipple>
      </ScaleDecorator>
    );
  };

  useEffect(() => {
    buildBrowseTree();
  }, [playlistIds.length]);

  useEffect(() => {
    if (PIPMode) {
      navigation.navigate(ViewEnum.LYRICS as never);
      navigation.dispatch(DrawerActions.closeDrawer());
    } else {
      navigation.goBack();
    }
  }, [PIPMode]);

  useEffect(() => {
    function deepLinkHandler(data: { url: string }) {
      if (data.url === 'trackplayer://notification.click') {
        logger.debug('[Drawer] click from notification; navigate to home');
        navigation.navigate(ViewEnum.PLAYER_HOME as never);
      }
    }

    // This event will be fired when the app is already open and the notification is clicked
    const subscription = Linking.addEventListener('url', deepLinkHandler);

    return () => {
      subscription.remove();
    };
  }, []);

  return PIPMode ? (
    <></>
  ) : (
    <View {...props}>
      <View style={styles.topPadding} />
      <BiliCard backgroundURI={playerStyle.biliGarbCard}>
        <RenderDrawerItem
          icon={'home-outline'}
          view={ViewEnum.PLAYER_HOME}
          text={'appDrawer.homeScreenName'}
        />
      </BiliCard>
      <RenderDrawerItem
        icon={'compass'}
        view={ViewEnum.EXPORE}
        text={'appDrawer.exploreScreenName'}
      />
      <RenderDrawerItem
        icon={'cog'}
        view={ViewEnum.SETTINGS}
        text={'appDrawer.settingScreenName'}
      />
      <Divider />
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
              onPress={() => navigation.navigate(ViewEnum.SETTINGS as never)}
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
        />
      </TouchableRipple>
      <NewPlaylistDialog
        visible={newPlaylistDialogOpen}
        fromList={playlists[STORAGE_KEYS.SEARCH_PLAYLIST_KEY]}
        onClose={() => setNewPlaylistDialogOpen(false)}
        onSubmit={() => setNewPlaylistDialogOpen(false)}
      />
      <DraggableFlatList
        style={styles.draggableFlatList}
        data={playlistIds.map(val => playlists[val])}
        onDragEnd={({ data }) =>
          setPlaylistIds(data.map(playlist => playlist.id))
        }
        keyExtractor={item => item?.id}
        renderItem={renderItem}
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
  topPadding: {
    height: 10,
  },
  playlistItemContainer: {
    flexDirection: 'row',
  },
  playlistItemTextContainer: {
    flex: 4,
    justifyContent: 'center',
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
  draggableFlatList: {
    maxHeight: Dimensions.get('window').height - 330,
  },
  bottomInfo: {
    paddingBottom: 20,
  },
  bottomInfoText: {
    textAlign: 'center',
  },
  drawerItemContainer: { flexDirection: 'row' },
  drawerItemTextContainer: { justifyContent: 'center' },
  playlistItemIconContainer: { alignItems: 'flex-end' },
});
