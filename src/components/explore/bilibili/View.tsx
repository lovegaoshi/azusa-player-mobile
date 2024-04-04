import * as React from 'react';
import { View, ScrollView, Text, Dimensions } from 'react-native';

import { fetchDynamic } from '@utils/mediafetch/biliDynamic';
import { fetchRanking } from '@utils/mediafetch/biliRanking';
import { styles } from '@components/style';

const BiliSongCatsCard = ({ songs = [] }: { songs?: NoxMedia.Song[] }) => {
  return (
    <View>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={Dimensions.get('window').width * 0.8}
      >
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon1</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon2</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon3</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon4</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon5</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon6</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon7</Text>
        <Text style={{ fontSize: 50, color: 'white' }}>Coming Soon8</Text>
      </ScrollView>
    </View>
  );
};

export default () => {
  const [biliDynamic, setBiliDynamic] = React.useState<{
    [key: number]: NoxMedia.Song[];
  }>({});
  const [biliRanking, setBiliRanking] = React.useState<{
    [key: number]: NoxMedia.Song[];
  }>({});
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    const init = async () => {
      if (!loading) return;
      await Promise.all([
        fetchRanking().then(setBiliRanking),
        fetchDynamic().then(setBiliDynamic),
      ]);
      setLoading(true);
    };
    init();
  }, []);

  if (loading) {
    return (
      <View style={styles.flex}>
        <Text style={{ fontSize: 50 }}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.flex}>
      <BiliSongCatsCard />
    </View>
  );
};
