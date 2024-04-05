import * as React from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  FlatList,
  TouchableOpacity,
} from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

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
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const { playAsSearchList } = usePlayback();

  return (
    <View
      style={{
        width: Dimensions.get('window').width * 0.8,
        height: 390,
        paddingRight: 10,
        paddingLeft: 5,
      }}
    >
      <Text style={{ fontSize: 20, color: 'white' }}>{category}</Text>
      <FlatList
        showsVerticalScrollIndicator={false}
        data={songs}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10 }}>
            <TouchableOpacity
              style={{ height: 70, flexDirection: 'row' }}
              onPress={() => playAsSearchList({ songs, song: item })}
            >
              <Image
                style={{ width: 70, height: 70, borderRadius: 5 }}
                source={{ uri: item.cover }}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: playerStyle.metaData.darkTheme ? 'white' : 'black',
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
      <Text style={{ fontSize: 20 }}>BiliCards</Text>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={Dimensions.get('window').width * 0.8}
        showsVerticalScrollIndicator={false}
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
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      if (!loading) return;
      await Promise.all([
        fetchRanking().then(setBiliRanking),
        // fetchDynamic().then(setBiliDynamic),
      ]);
      setLoading(false);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.flex}>
        <Text style={{ fontSize: 50, color: 'white' }}>Loading...</Text>
      </View>
    );
  }

  return (
    <ScrollView style={styles.flex}>
      <Text style={{ paddingHorizontal: 5, fontSize: 20 }}>
        Bilibili experimental discover page
      </Text>
      <BiliSongCatsCard songs={biliRanking} />
    </ScrollView>
  );
};
