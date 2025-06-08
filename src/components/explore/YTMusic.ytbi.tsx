import { View, ScrollView } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import React, { useEffect } from 'react';
import isArray from 'lodash/isArray';
import {
  ChipCloudChip,
  MusicCarouselShelf,
  MusicResponsiveListItem,
  MusicTwoRowItem,
} from 'youtubei.js/dist/src/parser/nodes';

import { styles } from '@components/style';
import useYTMExplore, {
  SongTransform,
  VideoTransform,
  PlaylistTransform,
  ArtistTransform,
} from '@stores/explore/ytmHome.ytbi';
import { YTSongRow } from './SongRow';
import { BiliSongsArrayTabCard } from './SongTab';

interface ContentProps {
  content: MusicCarouselShelf;
  key?: string;
}

export const YTMixedContent = ({ content }: ContentProps) => {
  if (!isArray(content.contents)) {
    return <></>;
  }
  const filteredContent = content.contents.filter(v => v);
  const title = content.header?.title.text ?? 'N/A';
  // @ts-expect-error
  switch (filteredContent[0]?.item_type) {
    case 'playlist':
      return (
        <YTSongRow
          songs={filteredContent.map(v =>
            PlaylistTransform(v as MusicTwoRowItem),
          )}
          title={title}
        />
      );
    case 'song':
      return (
        <BiliSongsArrayTabCard
          songs={SongTransform(filteredContent as MusicResponsiveListItem[])}
          title={title}
        />
      );
    case 'video':
      return (
        <BiliSongsArrayTabCard
          songs={filteredContent.map(v => VideoTransform(v as MusicTwoRowItem))}
          title={title}
        />
      );
    case 'artist':
      return (
        <YTSongRow
          songs={filteredContent.map(v =>
            ArtistTransform(v as MusicTwoRowItem),
          )}
          title={title}
        />
      );
    default:
      console.log('[YTM] not supported!', filteredContent[0]?.type, content);
      return <></>;
  }
};

export default ({
  onScroll,
  onMomentumScrollEnd,
}: NoxComponent.ScrollableProps) => {
  const moods = useYTMExplore(state => state.moods);
  const refreshHome = useYTMExplore(state => state.refreshHome);
  const initialize = useYTMExplore(state => state.initialize);
  const activeMood = useYTMExplore(state => state.activeMood);
  const setActiveMood = useYTMExplore(state => state.setActiveMood);
  const contents = useYTMExplore(state => state.homedata)?.sections;

  const onClickMood = (mood: ChipCloudChip) => {
    const newMood = mood === activeMood ? undefined : mood;
    setActiveMood(newMood);
    refreshHome(newMood);
  };

  const carouselShelfs = contents?.filter(
    v => v.type === 'MusicCarouselShelf',
  ) as MusicCarouselShelf[] | undefined;

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        style={{ flex: 0, flexGrow: 0 }}
        onScroll={onScroll}
        onMomentumScrollEnd={onMomentumScrollEnd}
      >
        {moods.map(mood => (
          <View style={styles.rowView} key={mood.endpoint?.payload.params}>
            <Button
              key={mood.text}
              mode={mood === activeMood ? 'contained' : 'contained-tonal'}
              onPress={() => onClickMood(mood)}
            >
              {mood.text}
            </Button>
            <View style={{ width: 15 }} />
          </View>
        ))}
      </ScrollView>
      <View style={{ height: 10 }} />
      <ScrollView style={{ flex: 1 }}>
        {carouselShelfs ? (
          carouselShelfs.map((content: any) => (
            <YTMixedContent content={content} key={content.header?.title} />
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
