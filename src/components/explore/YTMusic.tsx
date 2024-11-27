import { View, ScrollView } from 'react-native';
import { ActivityIndicator, Button } from 'react-native-paper';
import React, { useEffect, useState } from 'react';
import _ from 'lodash';
import {
  MixedContent,
  ParsedPlaylist,
  ParsedAlbum,
  FlatSong,
  ParsedVideo,
} from 'libmuse';

import { styles } from '@components/style';
import useYTMExplore from '@stores/explore/ytm';
import { YTSongRow } from './SongRow';
import { fetchYtmPlaylist } from '@utils/mediafetch/ytbPlaylist.muse';
import { BiliSongsArrayTabCard } from './SongTab';
import SongTS from '@objects/Song';
import { Source } from '@enums/MediaFetch';

interface ContentProps {
  content: MixedContent;
  key?: string;
}

const YTPlaylistTransform = (v: ParsedPlaylist[]) =>
  v.map(i => ({
    cover: _.last(i.thumbnails)!.url,
    name: i?.title,
    singer: i.description!,
    getPlaylist: async () => {
      return { songs: await fetchYtmPlaylist(i?.playlistId) };
    },
  }));

const YTAlbumTransform = (v: ParsedAlbum[]) =>
  v.map(i => ({
    cover: _.last(i.thumbnails)!.url,
    name: i.title,
    singer: i.album_type!,
    getPlaylist: async () => {
      // TODO: this is broken in react-native but passes in test. but why?
      const songs = await fetchYtmPlaylist(i.audioPlaylistId);
      return { songs };
    },
  }));

const YTMFlatSongTransform = (v: FlatSong[]) =>
  v.map(i =>
    SongTS({
      cid: `${Source.ytbvideo}-${i.videoId}`,
      bvid: i.videoId!,
      name: i.title,
      nameRaw: i.title,
      singer: i.artists?.[0].name ?? '',
      singerId: i.artists?.[0].id ?? '',
      cover: _.last(i.thumbnails)!.url,
      lyric: '',
      page: 1,
      duration: 0,
      album: i.album?.name ?? i.title,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  );

const YTMInlineVideoTransform = (v: ParsedVideo[]) =>
  v.map(i =>
    SongTS({
      cid: `${Source.ytbvideo}-${i.videoId}`,
      bvid: i.videoId!,
      name: i.title,
      nameRaw: i.title,
      singer: i.artists?.[0].name ?? '',
      singerId: i.artists?.[0].id ?? '',
      cover: _.last(i.thumbnails)!.url,
      lyric: '',
      page: 1,
      duration: 0,
      source: Source.ytbvideo,
      metadataOnLoad: true,
    }),
  );

const YTMixedContent = ({ content }: ContentProps) => {
  if (!_.isArray(content.contents)) {
    return <></>;
  }
  const filteredContent = content.contents.filter(v => v);
  switch (filteredContent[0]?.type) {
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
