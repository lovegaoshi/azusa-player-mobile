import {
  ScrollView,
  StyleSheet,
  View,
  Dimensions,
  Linking,
} from 'react-native';
import { Image } from 'expo-image';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { IconButton, Text, ActivityIndicator } from 'react-native-paper';

import FlexView from '@components/commonui/FlexViewNewArch';
import { NoxRoutes } from '@enums/Routes';
import useArtist from '@stores/explore/artist';
import { YTSongRow } from '../explore/SongRow';
import { BiliSongsArrayTabCard } from '../explore/SongTab';
import { useNoxSetting } from '@stores/useApp';
import { goToArtistExternalPage } from '@utils/artistfetch/fetch';

export default ({ navigation }: NoxComponent.StackNavigationProps) => {
  const dimension = Dimensions.get('window');
  const loading = useArtist(state => state.loading);
  const song = useArtist(state => state.song);
  const result = useArtist(state => state.result);
  const playerStyle = useNoxSetting(state => state.playerStyle);

  const scrollYOffset = useSharedValue(0);
  const scrollYHeight = useSharedValue(0);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const visibleOffsetRange = scrollYOffset.value - scrollYHeight.value / 3;
    return {
      opacity: visibleOffsetRange > 0 ? withTiming(1) : withTiming(0),
    };
  });

  if (loading) {
    return (
      <FlexView>
        <View>
          <Text variant="titleLarge">
            Now Loading: {song?.singer}'s Artist Page
          </Text>
          <View style={mStyles.indicatorContainer} />
          <ActivityIndicator size={100} />
        </View>
      </FlexView>
    );
  }

  if (result === undefined) {
    return (
      <FlexView>
        <View style={{ paddingLeft: 10 }}>
          <View style={mStyles.indicatorContainer} />
          <Text variant="titleLarge">Uh oh...</Text>
          <Text variant="bodyLarge">
            Nothing will be displayed. You shouldnt be here.
          </Text>
        </View>
      </FlexView>
    );
  }

  return (
    <FlexView>
      <View>
        <View
          style={{
            position: 'absolute',
            flexDirection: 'row',
            zIndex: 1,
          }}
        >
          <Animated.View
            style={[
              {
                width: dimension.width,
                height: 60,
                position: 'absolute',
                backgroundColor: playerStyle.colors.primaryContainer,
              },
              animatedHeaderStyle,
            ]}
          />
          <IconButton
            iconColor={playerStyle.colors.primary}
            icon={'arrow-left'}
            onPress={() => navigation.navigate(NoxRoutes.Playlist)}
            size={30}
          />
          <Animated.View
            style={[{ justifyContent: 'center' }, animatedHeaderStyle]}
          >
            <Text variant="titleLarge">{result.artistName}</Text>
          </Animated.View>
          <View style={{ flex: 1, alignItems: 'flex-end' }}>
            <IconButton
              iconColor={playerStyle.colors.primary}
              icon={'share'}
              onPress={() => Linking.openURL(goToArtistExternalPage(song!)!)}
              size={30}
            />
          </View>
        </View>
        <ScrollView
          onScroll={e => {
            scrollYOffset.value = e.nativeEvent.contentOffset.y;
            scrollYHeight.value = e.nativeEvent.layoutMeasurement.height;
          }}
        >
          <Image
            style={{
              width: dimension.width,
              height: Math.max(dimension.height / 3, 200),
            }}
            source={result.profilePicURL}
          />
          <Text variant="headlineLarge">{result.artistName}</Text>
          <BiliSongsArrayTabCard
            songs={result.ProfilePlaySongs}
            title="Latest"
          />
          <BiliSongsArrayTabCard songs={result.topSongs} title="Top" />
          <YTSongRow songs={result.albums} title="Albums" />
          <Text>{result.aboutString}</Text>
        </ScrollView>
      </View>
    </FlexView>
  );
};

const mStyles = StyleSheet.create({
  indicatorContainer: {
    height: 40,
  },
});
