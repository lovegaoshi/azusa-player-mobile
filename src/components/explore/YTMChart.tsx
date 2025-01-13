import { View, ScrollView } from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import React, { useEffect } from 'react';
import _ from 'lodash';
import { useTranslation } from 'react-i18next';

import { styles } from '@components/style';
import useYTMChartExplore from '@stores/explore/ytmchart';
import { YTMixedContent } from './YTMusic';
import { toMixedContent } from './Utils';

export default () => {
  const { t } = useTranslation();
  const refreshHome = useYTMChartExplore(state => state.refreshHome);
  const initialize = useYTMChartExplore(state => state.initialize);
  const loading = useYTMChartExplore(state => state.loading);
  const songs = useYTMChartExplore(state => state.songs);
  const artists = useYTMChartExplore(state => state.artists);
  const genres = useYTMChartExplore(state => state.genres);
  const videos = useYTMChartExplore(state => state.videos);
  const trending = useYTMChartExplore(state => state.trending);

  useEffect(() => {
    initialize();
  }, []);

  return (
    <View style={{ flex: 1 }}>
      <View style={{ height: 10 }} />
      <ScrollView style={{ flex: 1 }}>
        {loading ? (
          <View style={styles.alignMiddle}>
            <ActivityIndicator size={100} />
          </View>
        ) : (
          <View>
            <YTMixedContent
              content={toMixedContent(trending, t('YTMusic.ChartTrending'))}
            />
            <YTMixedContent
              content={toMixedContent(genres, t('YTMusic.ChartGenres'))}
            />
            <YTMixedContent
              content={toMixedContent(artists, t('YTMusic.ChartArtist'))}
            />
            <YTMixedContent
              content={toMixedContent(videos, t('YTMusic.ChartVideo'))}
            />
            <YTMixedContent
              content={toMixedContent(songs, t('YTMusic.ChartSongs'))}
            />
          </View>
        )}
      </ScrollView>
    </View>
  );
};
