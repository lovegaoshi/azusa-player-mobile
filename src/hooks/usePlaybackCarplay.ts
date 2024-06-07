import { useEffect, useState } from 'react';
import { Platform } from 'react-native';
import {
  CarPlay,
  NowPlayingTemplate,
  ListTemplate,
  TabBarTemplate,
} from 'react-native-carplay';
import { useTranslation } from 'react-i18next';

import { PLAYLIST_MEDIAID } from '@enums/Playlist';
import usePlayback from './usePlayback';

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
    const playlistSection = {
      header: t('AndroidAuto.PlaylistTab'),
      items: playlistIds.map(v => ({
        text: playlists[v].title,
        mediaId: v,
      })),
    };
    const playlistTemplate = new ListTemplate({
      id: Templates.Playlist,
      sections: [playlistSection],
      title: 'List Template',
      onItemSelect: async item =>
        playFromMediaId(`${PLAYLIST_MEDIAID}${playlistIds[item.index]}`).then(
          makeNowPlayingTemplate
        ),
    });
    const tabBarTemplate = new TabBarTemplate({
      templates: [playlistTemplate],
      onTemplateSelect: () => {},
    });
    CarPlay.setRootTemplate(tabBarTemplate);
  };

  const makeNowPlayingTemplate = () => {
    if (!carPlayConnected) return;
    const template = new NowPlayingTemplate({
      buttons: [
        {
          id: 'foo',
          type: 'more',
        },
        {
          id: 'demo',
          type: 'playback',
        },
        {
          id: 'baz',
          type: 'image',
          image: { uri: 'https://rntp.dev/example/Longing.jpeg' },
        },
      ],
      albumArtistButtonEnabled: true,
      upNextButtonTitle: 'Tester',
      upNextButtonEnabled: false,
      onUpNextButtonPressed() {
        console.log('up next was pressed');
      },
      onButtonPressed(e) {
        console.log(e);
      },
    });
    CarPlay.enableNowPlaying(true);
    CarPlay.pushTemplate(template);
  };

  useEffect(() => {
    if (Platform.OS !== 'ios') return;
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
  }, [carPlayConnected]);

  return { carPlayConnected, buildBrowseTree };
};
