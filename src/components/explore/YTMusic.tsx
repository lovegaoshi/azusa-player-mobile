import { View, ScrollView } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import isArray from 'lodash/isArray';
import {
  MixedContent,
  ParsedPlaylist,
  ParsedAlbum,
  FlatSong,
  ParsedVideo,
  RelatedArtist,
} from 'libmuse';

import { styles } from '@components/style';
import useYTMExplore, {
  YTPlaylistTransform,
  YTAlbumTransform,
  YTMFlatSongTransform,
  YTMInlineVideoTransform,
  YTArtistTransform,
} from '@stores/explore/ytmHome.muse';
import { YTSongRow } from './SongRow';
import { BiliSongsArrayTabCard } from './SongTab';

interface ContentProps {
  content: MixedContent;
  key?: string;
}

export const YTMixedContent = ({ content }: ContentProps) => {
  if (!isArray(content.contents)) {
    return <></>;
  }
  const filteredContent = content.contents.filter(v => v);
  switch (filteredContent[0]?.type) {
    case 'artist':
      return (
        <YTSongRow
          songs={YTArtistTransform(filteredContent as RelatedArtist[])}
          title={content.title!}
        />
      );
    case 'playlist':
      return (
        <YTSongRow
          songs={YTPlaylistTransform(filteredContent as ParsedPlaylist[])}
          title={content.title!}
        />
      );
    case 'album':
      return (
        <YTSongRow
          songs={YTAlbumTransform(filteredContent as ParsedAlbum[])}
          title={content.title!}
        />
      );
    case 'flat-song':
      return (
        <BiliSongsArrayTabCard
          songs={YTMFlatSongTransform(filteredContent as FlatSong[])}
          title={content.title!}
        />
      );
    case 'inline-video':
      return (
        <BiliSongsArrayTabCard
          songs={YTMInlineVideoTransform(filteredContent as ParsedVideo[])}
          title={content.title!}
        />
      );
    case 'video':
      return (
        <BiliSongsArrayTabCard
          songs={YTMInlineVideoTransform(filteredContent as ParsedVideo[])}
          title={content.title!}
        />
      );
    default:
      console.log('not supported!', filteredContent[0]?.type, content);
      return <></>;
  }
};

export default () => {
  const [activeMood, setActiveMood] = useState('');
  const moods = useYTMExplore(state => state.moods);
  const refreshHome = useYTMExplore(state => state.refreshHome);
  const initialize = useYTMExplore(state => state.initialize);
  const contents = useYTMExplore(state => state.homedata)?.results;

  const onClickMood = (mood: string) => {
    const newMood = mood === activeMood ? '' : mood;
    setActiveMood(newMood);
    refreshHome(newMood);
  };

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 0, flexGrow: 0 }}
      >
        {moods.map(mood => (
          <View style={styles.rowView} key={mood.params}>
            <Button
              key={mood.name}
              mode={
                mood.params === activeMood ? 'contained' : 'contained-tonal'
              }
              onPress={() => onClickMood(mood.params)}
            >
              {mood.name}
            </Button>
            <View style={{ width: 15 }} />
          </View>
        ))}
      </ScrollView>
      <View style={{ height: 10 }} />
      <ScrollView style={{ flex: 1 }}>
        {contents ? (
          contents.map(content => (
            <YTMixedContent content={content} key={content.browseId!} />
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
