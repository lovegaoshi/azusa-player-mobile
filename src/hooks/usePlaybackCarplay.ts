import { useEffect, useState } from 'react';
import {
  CarPlay,
  NowPlayingTemplate,
  ListTemplate,
  TabBarTemplate,
} from 'react-native-carplay';
import { useTranslation } from 'react-i18next';
import i18n from 'i18next';

import { PlaylistMediaID } from '@enums/Playlist';
import usePlayback from './usePlayback';
import { cycleThroughPlaymodeIOS as cyclePlaymode } from '@stores/playingList';
import { isIOS } from '@utils/RNUtils';
import logger from '@utils/Logger';
import { useNoxSetting } from '@stores/useApp';
import { playFromMediaId as playFromMediaIdNoHook } from './usePlayback.migrate';

enum Templates {
  Playlist = 'playlistTemplate',
}

interface SetupCarplayTemplate {
  t?: (key: string) => string;
  playlistIds?: string[];
  playlists?: Record<string, NoxMedia.Playlist>;
  playFromMediaId?: (mediaId: string) => Promise<void>;
}
export const setupCarplayTemplate = async ({
  t = i18n.t,
  playlistIds = useNoxSetting.getState().playlistIds,
  playlists = useNoxSetting.getState().playlists,
  playFromMediaId = playFromMediaIdNoHook,
}: SetupCarplayTemplate) => {
  if (!isIOS) return;

  const makeNowPlayingTemplate = (playback = 'shuffle') => {
    return new NowPlayingTemplate({
      buttons: [
        {
          id: 'favorite',
          type: 'add-to-library',
        },
        {
          id: 'change-playmode',
          // @ts-expect-error
          type: playback,
        },
      ],
      albumArtistButtonEnabled: true,
      upNextButtonTitle: 'Tester',
      upNextButtonEnabled: false,
      onUpNextButtonPressed() {
        console.log('up next was pressed');
      },
      onButtonPressed(e) {
        switch (e.id) {
          case 'favorite':
            return;
          case 'change-playmode':
            makeNowPlayingTemplate(cyclePlaymode());
        }
      },
    });
  };

  const pushNowPlayingTemplate = (template = makeNowPlayingTemplate()) => {
    if (!template) return;
    CarPlay.pushTemplate(template);
    CarPlay.enableNowPlaying(true);
  };

  const nowPlayingSection = {
    header: t('AndroidAuto.NowPlayingTab'),
    items: [{ text: t('AndroidAuto.GoToNowPlayingTab') }],
  };
  const playlistSection = {
    header: t('AndroidAuto.PlaylistTab'),
    items: playlistIds.map(v => ({
      text: playlists[v].title,
      mediaId: v,
    })),
  };
  const playlistTemplate = new ListTemplate({
    id: Templates.Playlist,
    sections: [nowPlayingSection, playlistSection],
    title: 'List Template',
    tabTitle: 'APM',
    onItemSelect: async item => {
      if (item.index === 0) {
        return pushNowPlayingTemplate();
      }
      playFromMediaId(`${PlaylistMediaID}${playlistIds[item.index - 1]}`).then(
        () => pushNowPlayingTemplate(),
      );
    },
  });
  const tabBarTemplate = new TabBarTemplate({
    title: 'APM',
    tabTitle: 'APM',
    templates: [playlistTemplate],
    onTemplateSelect: () => {},
  });
  CarPlay.setRootTemplate(tabBarTemplate);
};

export default function usePlaybackCarplay() {
  const { t } = useTranslation();
  const [carPlayConnected, setCarPlayConnected] = useState(CarPlay.connected);
  const { playlists, playlistIds, playFromMediaId } = usePlayback();

  /**
   * APM's root template will be the same as
   */
  const buildBrowseTree = () =>
    setupCarplayTemplate({
      t,
      playlistIds,
      playlists,
      playFromMediaId,
    });

  useEffect(() => {
    if (!isIOS) return;
    function onConnect() {
      setCarPlayConnected(true);
    }

    function onDisconnect() {
      setCarPlayConnected(false);
    }

    CarPlay.registerOnConnect(onConnect);
    CarPlay.registerOnDisconnect(onDisconnect);

    return () => {
      CarPlay.unregisterOnConnect(onConnect);
      CarPlay.unregisterOnDisconnect(onDisconnect);
    };
  });

  useEffect(() => {
    logger.debug('carplay connected');
    buildBrowseTree();
  }, [carPlayConnected, playlistIds]);

  return { carPlayConnected, buildBrowseTree };
}
