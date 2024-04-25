import * as React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import { Text } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import { fetchDynamic } from '@utils/mediafetch/biliDynamic';
import { fetchRanking } from '@utils/mediafetch/biliRanking';
import { fetchMusicTop } from '@utils/mediafetch/biliMusicTop';
import { styles } from '@components/style';
import {
  BiliCatSongs,
  BiliSongsTabCard,
  BiliSongsArrayTabCard,
} from '../SongTab';
import { BiliSongRow } from '../SongRow';

export default () => {
  const { t } = useTranslation();
  const [biliDynamic, setBiliDynamic] = React.useState<BiliCatSongs>({});
  const [biliRanking, setBiliRanking] = React.useState<BiliCatSongs>({});
  const [biliMusicTop, setBiliMusicTop] = React.useState<NoxMedia.Song[]>([]);
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const initData = async () =>
    Promise.all([
      fetchRanking().then(setBiliRanking),
      fetchDynamic().then(setBiliDynamic),
      fetchMusicTop().then(setBiliMusicTop),
    ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    fetchDynamic()
      .then(setBiliDynamic)
      .then(() => setRefreshing(false));
  }, []);

  React.useEffect(() => {
    if (!loading) return;
    initData().then(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <View style={styles.flex}>
        <Text style={{ fontSize: 50, color: 'white' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.flex}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <BiliSongsTabCard songs={biliRanking} title={t('BiliCategory.ranking')} />
      <Text style={{ fontSize: 20, paddingLeft: 5, paddingBottom: 10 }}>
        {t('BiliCategory.dynamic')}
      </Text>
      {Object.keys(biliDynamic).map((k, i) => (
        <BiliSongRow
          key={`BiliDynamicRow${i}`}
          songs={biliDynamic[Number(k)]}
          title={t(`BiliCategory.${k}`)}
        />
      ))}
      <BiliSongsArrayTabCard
        songs={biliMusicTop}
        title={t('BiliCategory.top')}
      />
    </ScrollView>
  );
};
