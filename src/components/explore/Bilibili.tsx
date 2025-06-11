import { useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { styles } from '@components/style';
import { BiliSongsTabCard, BiliSongsArrayTabCard } from './SongTab';
import { BiliSongRow } from './SongRow';
import useBiliExplore from '@stores/explore/bilibili';
import { BiliMusicTid } from '@enums/MediaFetch';
import { PaperText as Text } from '@components/commonui/ScaledText';

interface Props extends NoxComponent.ScrollableProps {
  style?: ViewStyle;
}
export default ({ style, onScroll, onMomentumScrollEnd }: Props) => {
  const { t } = useTranslation();
  const loading = useBiliExplore(state => state.loading);
  const refreshing = useBiliExplore(state => state.refreshing);
  const onRefresh = useBiliExplore(state => state.onRefresh);
  const biliDynamic = useBiliExplore(state => state.biliDynamic);
  const biliRanking = useBiliExplore(state => state.biliRanking);
  const biliMusicTop = useBiliExplore(state => state.biliMusicTop);
  const biliMusicHot = useBiliExplore(state => state.biliMusicHot);
  const biliMusicNew = useBiliExplore(state => state.biliMusicNew);
  const init = useBiliExplore(state => state.init);

  useEffect(() => {
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.flex}>
        <View style={mStyles.indicatorContainer} />
        <ActivityIndicator size={100} />
      </View>
    );
  }

  return (
    <ScrollView
      style={[styles.flex, style]}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
      onScroll={onScroll}
      onMomentumScrollEnd={onMomentumScrollEnd}
    >
      <BiliSongsTabCard songs={biliRanking} title={t('BiliCategory.ranking')} />
      <Text style={mStyles.dynamicHeader}>{t('BiliCategory.dynamic')}</Text>
      {BiliMusicTid.filter(v => biliDynamic[v]).map(k => (
        <BiliSongRow
          key={`BiliDynamicRow${k}`}
          songs={biliDynamic[Number(k)]}
          title={t(`BiliCategory.${k}`)}
        />
      ))}
      <BiliSongsArrayTabCard
        songs={biliMusicTop}
        title={t('BiliCategory.top')}
      />
      <BiliSongsArrayTabCard
        songs={biliMusicHot}
        title={t('BiliCategory.hot')}
      />
      <BiliSongsArrayTabCard
        songs={biliMusicNew}
        title={t('BiliCategory.new')}
      />
    </ScrollView>
  );
};
const mStyles = StyleSheet.create({
  indicatorContainer: {
    height: 40,
  },
  dynamicHeader: { fontSize: 20, paddingLeft: 5, paddingBottom: 10 },
});
