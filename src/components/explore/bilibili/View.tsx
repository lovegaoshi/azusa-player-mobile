import { useEffect } from 'react';
import {
  View,
  ScrollView,
  RefreshControl,
  StyleSheet,
  ViewStyle,
} from 'react-native';
import { ActivityIndicator, Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { styles } from '@components/style';
import { BiliSongsTabCard, BiliSongsArrayTabCard } from '../SongTab';
import { BiliSongRow } from '../SongRow';
import { UseBiliExplore } from './useBiliExplore';

interface Props {
  useBiliExplore: UseBiliExplore;
  style?: ViewStyle;
}
export default ({ style, useBiliExplore }: Props) => {
  const { t } = useTranslation();
  const {
    loading,
    refreshing,
    onRefresh,
    biliDynamic,
    biliRanking,
    biliMusicTop,
    biliMusicHot,
    biliMusicNew,
    init,
  } = useBiliExplore;

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
    >
      <BiliSongsTabCard songs={biliRanking} title={t('BiliCategory.ranking')} />
      <Text style={mStyles.dynamicHeader}>{t('BiliCategory.dynamic')}</Text>
      {Object.keys(biliDynamic).map((k, i) => (
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
