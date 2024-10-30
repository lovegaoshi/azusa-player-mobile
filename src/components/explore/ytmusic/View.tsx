import { View, ScrollView } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  get_playlist,
  MixedContent,
  get_album,
  MixedItem,
  ParsedPlaylist,
  ParsedAlbum,
} from 'libmuse';

import { styles } from '@components/style';
import { UseYTMExplore } from './useYTMExplore';
import { YTSongRow } from '../SongRow';
import { fetchYtmPlaylist } from '@utils/mediafetch/ytbPlaylist.muse';

interface ContentProps {
  content: MixedContent;
  key?: string;
}

const YTFlatSongTransform = (v: any) =>
  v.map((i: any) => ({
    cover: '',
    name: i.title,
    getPlaylist: () => fetchYtmPlaylist(i),
  }));

const YTPlaylistTransform = (v: ParsedPlaylist[]) =>
  v.map(i => ({
    cover: _.last(i?.thumbnails)?.url!,
    name: i?.title,
    singer: i.description!,
    getPlaylist: async () => {
      return { songs: await fetchYtmPlaylist(i?.playlistId) };
    },
  }));

const YTAlbumTransform = (v: ParsedAlbum[]) =>
  v.map(i => ({
    cover: _.last(i?.thumbnails)?.url!,
    name: i?.title,
    singer: i.album_type!,
    getPlaylist: async () => {
      return { songs: await fetchYtmPlaylist(i?.audioPlaylistId) };
    },
  }));

const YTMixedContent = ({ content, key }: ContentProps) => {
  if (!_.isArray(content.contents)) {
    return <></>;
  }
  switch (content.contents[0]?.type) {
    case 'playlist':
      return (
        <YTSongRow
          songs={YTPlaylistTransform(content.contents as ParsedPlaylist[])}
          title={content.title!}
        />
      );
    case 'album':
      return (
        <YTSongRow
          songs={YTAlbumTransform(content.contents as ParsedAlbum[])}
          title={content.title!}
        />
      );
    case 'flat-song':
    default:
      console.log('not supported!', content);
      return <></>;
  }
};

interface Props {
  useYTMExplore: UseYTMExplore;
}
export default ({ useYTMExplore }: Props) => {
  const [activeMood, setActiveMood] = useState('');
  const { moods, refreshHome, initialize, contents } = useYTMExplore;

  const onClickMood = (mood: string) => {
    const newMood = mood === activeMood ? '' : mood;
    setActiveMood(newMood);
    refreshHome(newMood);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View>
      <ScrollView horizontal showsHorizontalScrollIndicator={false}>
        {moods.map(mood => (
          <View style={styles.rowView} key={mood.params}>
            <Button
              key={mood.name}
              mode={mood.params === activeMood ? 'contained' : 'outlined'}
              onPress={() => onClickMood(mood.params)}
            >
              {mood.name}
            </Button>
            <View style={{ width: 15 }} />
          </View>
        ))}
      </ScrollView>
      <View style={{ height: 10 }} />
      <ScrollView>
        {contents ? (
          contents.map(content => (
            <YTMixedContent content={content} key={content.browseId!!} />
          ))
        ) : (
          <View style={styles.alignMiddle}>
            <ActivityIndicator size={100} />
          </View>
        )}
      </ScrollView>
    </View>
  );
};
