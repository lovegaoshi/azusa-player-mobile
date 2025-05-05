import * as React from 'react';
import {
  View,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { FlashList } from '@shopify/flash-list';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';
import { useTranslation } from 'react-i18next';

import { chunkArray } from '@utils/Utils';
import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';
import { NoxRoutes } from '@enums/Routes';
import useNavigation from '@hooks/useNavigation';
import { styles } from '../style';
import { BiliMusicTid } from '@enums/MediaFetch';

export interface BiliCatSongs {
  [key: number]: NoxMedia.Song[];
}

export interface BiliSongCardProp {
  songs: NoxMedia.Song[];
  title?: string;
  totalSongs?: NoxMedia.Song[];
}

export const BiliSongCard = ({
  songs = [],
  title,
  totalSongs,
}: BiliSongCardProp) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const scroll = useNoxSetting(state => state.incSongListScrollCounter);
  const { playAsSearchList } = usePlayback();

  const fontColor = playerStyle.colors.primary;

  return (
    <View
      style={[
        style.cardContainer,
        // max 4 items per list
        { height: (Math.min(4, songs.length) * 390) / 4 },
      ]}
    >
      {title && <Text style={{ fontSize: 20, color: fontColor }}>{title}</Text>}
      <FlashList
        estimatedItemSize={390}
        showsVerticalScrollIndicator={false}
        data={songs}
        renderItem={({ item }) => (
          <View style={style.padding}>
            <TouchableOpacity
              style={style.cardPressable}
              onPress={() => {
                navigationGlobal.navigate({
                  route: NoxRoutes.PlayerHome,
                  params: { screen: NoxRoutes.Playlist },
                });
                playAsSearchList({
                  songs: totalSongs ?? songs,
                  song: item,
                  // HACK: oh well.
                }).then(() => setTimeout(scroll, 500));
              }}
            >
              <Image
                style={style.cardThumbnail}
                source={{ uri: item.cover, width: 140, height: 140 }}
                contentFit="cover"
              />
              <View style={styles.flex}>
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
                  style={{
                    color: playerStyle.colors.secondary,
                    paddingLeft: 5,
                  }}
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

export const BiliSongCatsCard = ({ songs = {} }: { songs?: BiliCatSongs }) => {
  const { t } = useTranslation();

  return (
    <View>
      <Text style={style.catContainer}>{t('BiliCategory.ranking')}</Text>
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
            title={t(`BiliCategory.${k}`)}
            songs={songs[Number(k)]}
          />
        ))}
        <View style={style.paddingVertical}></View>
      </ScrollView>
    </View>
  );
};

export const BiliSongsArrayTabCard = ({
  songs = [],
  title,
}: {
  songs?: NoxMedia.Song[];
  title: string;
}) => {
  if (songs.length === 0) {
    return <></>;
  }

  const splicedSongs: NoxMedia.Song[][] = chunkArray(songs, 4);

  return (
    <View>
      <Text style={style.arrayText}>{title}</Text>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={Dimensions.get('window').width * 0.8}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {splicedSongs.map((k, i) => (
          <BiliSongCard
            key={`BiliRankTab${k[0].id ?? i}`}
            songs={k}
            totalSongs={songs}
          />
        ))}
        <View style={style.paddingVertical}></View>
      </ScrollView>
    </View>
  );
};

export const BiliSongsTabCard = ({
  songs = {},
  title,
}: {
  songs?: BiliCatSongs;
  title: string;
}) => {
  const concatSongs = BiliMusicTid.reduce(
    (acc, curr) => acc.concat(songs[curr] ?? []),
    [] as NoxMedia.Song[],
  );

  return <BiliSongsArrayTabCard title={title} songs={concatSongs} />;
};

const style = StyleSheet.create({
  cardContainer: {
    width: Dimensions.get('window').width * 0.8,
    height: 390,
    paddingRight: 10,
    paddingLeft: 5,
  },
  padding: { paddingVertical: 10 },
  cardPressable: { height: 70, flexDirection: 'row' },
  cardThumbnail: { width: 70, height: 70, borderRadius: 5 },
  catContainer: { fontSize: 20, paddingLeft: 5, paddingBottom: 10 },
  paddingVertical: { width: Dimensions.get('window').width * 0.2 },
  arrayText: { fontSize: 20, paddingLeft: 5, paddingBottom: 0 },
});
