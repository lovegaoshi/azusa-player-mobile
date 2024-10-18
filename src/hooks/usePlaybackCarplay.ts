import { useEffect, useState } from 'react';
import {
  CarPlay,
  NowPlayingTemplate,
  ListTemplate,
  TabBarTemplate,
} from 'react-native-carplay';
import { useTranslation } from 'react-i18next';

import { PLAYLIST_MEDIAID } from '@enums/Playlist';
import usePlayback from './usePlayback';
import { cycleThroughPlaymodeIOS as cyclePlaymode } from '@stores/playingList';
import { isIOS } from '@utils/RNUtils';

enum Templates {
  Playlist = 'playlistTemplate',
}

export default () => {
  const { t } = useTranslation();
  const [carPlayConnected, setCarPlayConnected] = useState(CarPlay.connected);
  const { playlists, playlistIds, playFromMediaId } = usePlayback();

  /**
   * APM's root template will be the same as
   */
  const buildBrowseTree = () => {
    if (!carPlayConnected) return;
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
        playFromMediaId(
          `${PLAYLIST_MEDIAID}${playlistIds[item.index - 1]}`
        ).then(() => pushNowPlayingTemplate());
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

  const makeNowPlayingTemplate = (playback = 'shuffle') => {
    if (!carPlayConnected) return;
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
    buildBrowseTree();
  }, [carPlayConnected, playlistIds]);

  return { carPlayConnected, buildBrowseTree };
};
