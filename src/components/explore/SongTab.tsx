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
import { useNavigation } from '@react-navigation/native';

import { chunkArray } from '@utils/Utils';
import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';
import { NoxRoutes } from '@enums/Routes';

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
      style={{
        width: Dimensions.get('window').width * 0.8,
        height: 390,
        paddingRight: 10,
        paddingLeft: 5,
      }}
    >
      {title && <Text style={{ fontSize: 20, color: fontColor }}>{title}</Text>}
      <FlatList
        showsVerticalScrollIndicator={false}
        data={songs}
        renderItem={({ item }) => (
          <View style={{ paddingVertical: 10 }}>
            <TouchableOpacity
              style={{ height: 70, flexDirection: 'row' }}
              onPress={() => {
                navigationGlobal.navigate(NoxRoutes.Playlist as never);
                playAsSearchList({
                  songs: totalSongs ?? songs,
                  song: item,
                  // HACK: oh well.
                }).then(() => setTimeout(scroll, 500));
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
            title={t(`BiliCategory.${k}`)}
            songs={songs[Number(k)]}
          />
        ))}
        <View style={{ width: Dimensions.get('window').width * 0.2 }}></View>
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
  const splicedSongs: NoxMedia.Song[][] = chunkArray(songs, 4);

  return (
    <View>
      <Text style={{ fontSize: 20, paddingLeft: 5, paddingBottom: 10 }}>
        {title}
      </Text>
      <ScrollView
        horizontal
        disableIntervalMomentum
        snapToInterval={Dimensions.get('window').width * 0.8}
        showsVerticalScrollIndicator={false}
        showsHorizontalScrollIndicator={false}
      >
        {splicedSongs.map((k, i) => (
          <BiliSongCard
            key={`BiliRankTab${k[0].id}`}
            songs={k}
            totalSongs={songs}
          />
        ))}
        <View style={{ width: Dimensions.get('window').width * 0.2 }}></View>
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
  const concatSongs = Object.values(songs).reduce(
    (acc, curr) => acc.concat(curr),
    [],
  );

  return <BiliSongsArrayTabCard title={title} songs={concatSongs} />;
};
