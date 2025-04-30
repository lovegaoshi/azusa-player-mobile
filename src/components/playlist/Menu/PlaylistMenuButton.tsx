import React, { useRef } from 'react';
import { IconButton } from 'react-native-paper';
import { TrueSheet } from '@lodev09/react-native-true-sheet';
import { useTranslation } from 'react-i18next';
import { View } from 'react-native';

import { NoxSheetRoutes } from '@enums/Routes';
import { useNoxSetting } from '@stores/useApp';
import SheetIconEntry from '@components/commonui/bottomsheet/SheetIconEntry';
import NoxBottomSheet from '@components/commonui/bottomsheet/NoxBottomSheet';
import PlaylistSettingsButton from './PlaylistSettingsButton';
import { PlaylistTypes } from '@enums/Playlist';
import CopiedPlaylistButton from '@components/songmenu/CopiedPlaylistButton';
import PlaylistSortButton from './PlaylistSortButton';
import usePlaylist from './usePlaylistMenu';
import keepAwake from '@utils/keepAwake';

interface Props {
  disabled?: boolean;
  playlist: NoxMedia.Playlist;
  songListUpdateHalt: () => void;
}

export default ({ disabled = false, playlist, songListUpdateHalt }: Props) => {
  const { t } = useTranslation();
  const sheet = useRef<TrueSheet>(null);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const {
    playlistSync2Bilibili,
    playlistAnalyze,
    confirmOnPlaylistClear,
    confirmOnPlaylistDelete,
    confirmOnPlaylistReload,
    playlistCleanup,
    playlistBiliShazam,
    sortPlaylist,
  } = usePlaylist({});

  const limitedPlaylistFeatures = playlist?.type !== PlaylistTypes.Typical;

  const showSheet = (show = true) =>
    show ? sheet.current?.present() : sheet.current?.dismiss();

  const handlePress = () => {
    sheet.current?.present();
  };

  return (
    <React.Fragment>
      <IconButton
        icon={'dots-horizontal'}
        onPress={handlePress}
        size={25}
        disabled={disabled}
        //iconColor={playerStyle.colors.primary}
      />
      <NoxBottomSheet name={NoxSheetRoutes.PlaylistMenuSheet} ref={sheet}>
        <View style={{ paddingTop: 10 }} />
        <PlaylistSettingsButton
          disabled={limitedPlaylistFeatures}
          playlist={playlist}
          showSheet={showSheet}
        />
        <CopiedPlaylistButton
          getFromListOnClick={() => playlist}
          showSheet={showSheet}
          Button={SheetIconEntry}
        />
        <PlaylistSortButton
          sortPlaylist={(o, a, p) => {
            songListUpdateHalt();
            sortPlaylist(o, a, p);
          }}
          showSheet={showSheet}
          playlist={playlist}
        />
        <SheetIconEntry
          text={t('PlaylistOperations.bilisyncTitle')}
          icon={'sync'}
          onPress={() => {
            showSheet(false);
            keepAwake(playlistSync2Bilibili);
          }}
        />
        <SheetIconEntry
          text={t('PlaylistOperations.bilishazamTitle')}
          icon={'magnify-plus'}
          onPress={() => {
            showSheet(false);
            keepAwake(playlistBiliShazam);
          }}
        />
        <SheetIconEntry
          text={t('PlaylistOperations.analyticsTitle')}
          icon={'google-analytics'}
          onPress={() => {
            showSheet(false);
            playlistAnalyze();
          }}
        />
        <SheetIconEntry
          text={t('PlaylistOperations.removeBrokenTitle')}
          icon={'link-variant-remove'}
          onPress={() => {
            showSheet(false);
            playlistCleanup();
          }}
          disabled={limitedPlaylistFeatures}
        />
        <SheetIconEntry
          text={t('PlaylistOperations.reloadBVIDTitle')}
          icon={'reload'}
          onPress={() => {
            showSheet(false);
            confirmOnPlaylistReload();
          }}
          disabled={limitedPlaylistFeatures}
        />
        <SheetIconEntry
          text={t('PlaylistOperations.clearPlaylistTitle')}
          icon={'notification-clear-all'}
          onPress={() => {
            showSheet(false);
            confirmOnPlaylistClear();
          }}
          disabled={limitedPlaylistFeatures}
        />
        <SheetIconEntry
          text={t('PlaylistOperations.removePlaylistTitle')}
          icon={'trash-can'}
          onPress={() => {
            showSheet(false);
            confirmOnPlaylistDelete();
          }}
          disabled={limitedPlaylistFeatures}
        />
      </NoxBottomSheet>
    </React.Fragment>
  );
};
