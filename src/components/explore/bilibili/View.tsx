import * as React from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
  RefreshControl,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';
import { useNavigation } from '@react-navigation/native';

import { fetchDynamic } from '@utils/mediafetch/biliDynamic';
import { fetchRanking } from '@utils/mediafetch/biliRanking';
import { styles } from '@components/style';
import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';

interface BiliCatSongs {
  [key: number]: NoxMedia.Song[];
}

interface BiliSongCardProp {
  songs: NoxMedia.Song[];
  category: string;
}

const BiliSongCard = ({
  songs = [],
  category = 'Dummy Category',
}: BiliSongCardProp) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { playAsSearchList } = usePlayback();

  const fontColor = playerStyle.metaData.darkTheme ? 'white' : 'black';

  return (
    <View
      style={{
        width: Dimensions.get('window').width * 0.8,
        height: 390,
        paddingRight: 10,
        paddingLeft: 5,
      }}
    >
      <Text style={{ fontSize: 20, color: fontColor }}>{category}</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={songs}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10 }}>
            <TouchableOpacity
              style={{ height: 70, flexDirection: 'row' }}
              onPress={() => {
                navigationGlobal.navigate(
                  NoxEnum.View.View.PLAYER_PLAYLIST as never
                );
                playAsSearchList({ songs, song: item });
              }}
            >
              <Image
                style={{ width: 70, height: 70, borderRadius: 5 }}
                source={{ uri: item.cover }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: fontColor,
                    paddingLeft: 5,
                    flex: 1,
                  }}
                  variant="titleMedium"
                  numberOfLines={2}
                >
                  {item.name}
                </Text>
                <Text
                  style={{ color: 'grey', paddingLeft: 5 }}
                  variant="titleSmall"
                  numberOfLines={1}
                >
                  {item.singer}
                </Text>
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const BiliSongCatsCard = ({ songs = {} }: { songs?: BiliCatSongs }) => {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={{ fontSize: 20, paddingLeft: 5, paddingBottom: 10 }}>
        {t('BiliCategory.ranking')}
      </Text>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={Dimensions.get('window').width * 0.8}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {Object.keys(songs).map(k => (
          <BiliSongCard
            key={k}
            category={t(`BiliCategory.${k}`)}
            songs={songs[Number(k)]}
          />
        ))}
        <View style={{ width: Dimensions.get('window').width * 0.2 }}></View>
      </ScrollView>
    </View>
  );
};

export default () => {
  const [biliDynamic, setBiliDynamic] = React.useState<BiliCatSongs>({});
  const [biliRanking, setBiliRanking] = React.useState<BiliCatSongs>({});
  const [refreshing, setRefreshing] = React.useState(false);
  const [loading, setLoading] = React.useState(true);

  const initData = async () =>
    Promise.all([
      fetchRanking().then(setBiliRanking),
      // fetchDynamic().then(setBiliDynamic),
    ]);

  const onRefresh = React.useCallback(() => {
    setRefreshing(true);
    initData().then(() => setRefreshing(false));
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
      <Text style={{ paddingHorizontal: 5, fontSize: 20 }}>
        Bilibili experimental discover page
      </Text>
      <BiliSongCatsCard songs={biliRanking} />
    </ScrollView>
  );
};
