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
  useDerivedValue,
  useSharedValue,
  withTiming,
} from 'react-native-reanimated';
import { IconButton, Text, ActivityIndicator } from 'react-native-paper';
import { useTranslation } from 'react-i18next';

import FlexView from '@components/commonui/FlexViewNewArch';
import { NoxRoutes } from '@enums/Routes';
import useArtist from '@stores/explore/artist';
import { YTSongRow } from '../explore/SongRow';
import { BiliSongsArrayTabCard } from '../explore/SongTab';
import { useNoxSetting } from '@stores/useApp';
import { goToArtistExternalPage } from '@utils/artistfetch/fetch';
import { styles, ItemSelectStyles } from '../style';

export default ({ navigation }: NoxComponent.StackNavigationProps) => {
  const { t } = useTranslation();
  const dimension = Dimensions.get('window');
  const loading = useArtist(state => state.loading);
  const song = useArtist(state => state.song);
  const result = useArtist(state => state.result);
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const setExternalSearchText = useNoxSetting(
    state => state.setExternalSearchText,
  );

  const scrollYOffset = useSharedValue(0);
  const scrollYHeight = useSharedValue(0);
  const hideAt = useDerivedValue(() => scrollYHeight.value / 3);

  const animatedHeaderStyle = useAnimatedStyle(() => {
    const visibleOffsetRange = scrollYOffset.value - hideAt.value;
    return {
      opacity: visibleOffsetRange > 0 ? withTiming(1) : withTiming(0),
    };
  });

  const animatedArtistTitleOpacity = useDerivedValue(() => {
    // at 1 at scrollYHeight.value / 4
    // at 0 at scrollYHeight.value / 3
    const showAt = scrollYHeight.value / 5;
    if (scrollYOffset.value > hideAt.value) {
      return 0;
    }
    if (scrollYOffset.value < showAt) {
      return 1;
    }
    return 1 - (scrollYOffset.value - showAt) / (hideAt.value - showAt) || 1;
  });

  const animatedArtistHeaderStyle = useAnimatedStyle(() => ({
    opacity: animatedArtistTitleOpacity.value,
  }));

  const backgroundStyle = {
    backgroundColor: playerStyle.customColors.maskedBackgroundColor,
  };

  if (loading) {
    return (
      <FlexView>
        <View style={backgroundStyle}>
          <View style={mStyles.indicatorContainer} />
          <Text variant="titleLarge" style={styles.centerText}>
            {t('Artist.loading', { name: song?.singer })}
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
        <View style={[{ paddingLeft: 10 }, backgroundStyle]}>
          <View style={mStyles.indicatorContainer} />
          <Text variant="titleLarge">{t('Artist.errorTitle')}</Text>
          <Text variant="bodyLarge">{t('Artist.errorContent')}</Text>
        </View>
      </FlexView>
    );
  }

  return (
    <FlexView>
      <View style={backgroundStyle}>
        <View style={mStyles.headerContainer}>
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
          <View style={styles.flex} />
          <View style={styles.topBarIcons}>
            <IconButton
              iconColor={playerStyle.colors.primary}
              icon={'playlist-plus'}
              onPress={() =>
                setExternalSearchText(goToArtistExternalPage(song)!)
              }
              size={30}
            />
            <IconButton
              iconColor={playerStyle.colors.primary}
              icon={'share'}
              onPress={() => Linking.openURL(goToArtistExternalPage(song)!)}
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
          <Animated.View style={animatedArtistHeaderStyle}>
            <Image
              style={{
                width: dimension.width,
                height: Math.max(dimension.height / 3, 200),
              }}
              source={result.profilePicURL}
            />
            <View style={mStyles.titleTextContainer}>
              <Text variant="headlineLarge">{result.artistName}</Text>
              <Text>{t('Artist.subscribers', { c: result.subscribers })}</Text>
            </View>
          </Animated.View>
          <BiliSongsArrayTabCard
            songs={result.ProfilePlaySongs}
            title="Latest"
          />
          <BiliSongsArrayTabCard songs={result.topSongs} title="Top" />
          {result.albums.length > 0 && (
            <YTSongRow songs={result.albums} title="Albums" />
          )}
          <View style={ItemSelectStyles.skinItemTextContainer}>
            <Text>{result.sign}</Text>
            <Text>{result.aboutString}</Text>
          </View>
        </ScrollView>
      </View>
    </FlexView>
  );
};

const mStyles = StyleSheet.create({
  indicatorContainer: {
    height: 40,
  },
  titleTextContainer: {
    paddingLeft: 5,
    paddingBottom: 15,
  },
  headerContainer: {
    position: 'absolute',
    flexDirection: 'row',
    zIndex: 1,
  },
});
