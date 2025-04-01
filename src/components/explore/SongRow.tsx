import * as React from 'react';
import {
  View,
  Dimensions,
  FlatList,
  TouchableOpacity,
  StyleSheet,
} from 'react-native';
import { Text } from 'react-native-paper';
import Image from 'react-native-turbo-image';

import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';
import { NoxRoutes } from '@enums/Routes';
import { BiliSongCardProp } from './SongTab';
import useNavigation from '@hooks/useNavigation';
import { YTSongRowCard, YTSongRowProp } from './types';

export const BiliSongRow = ({
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
        width: Dimensions.get('window').width,
        paddingLeft: 5,
        paddingBottom: 10,
      }}
    >
      {title && (
        <Text style={{ fontSize: 20, color: fontColor, paddingBottom: 5 }}>
          {title}
        </Text>
      )}
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={songs}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.albumContainer}>
            <TouchableOpacity
              onPress={() => {
                navigationGlobal.navigate({
                  route: NoxRoutes.PlayerHome,
                  options: { screen: NoxRoutes.Playlist },
                });
                playAsSearchList({
                  songs: totalSongs ?? songs,
                  song: item,
                }).then(() => setTimeout(scroll, 500));
              }}
            >
              <Image
                style={styles.albumImage}
                source={{ uri: item.cover }}
                resizeMode={'cover'}
                resize={140}
              />
              <View style={styles.flex}>
                <Text
                  style={{
                    color: fontColor,
                    paddingLeft: 5,
                    width: 140,
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
                    width: 140,
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

// TODO: abstract as a parent class to above
export const YTSongRow = ({ songs = [], title }: YTSongRowProp) => {
  const navigationGlobal = useNavigation();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const scroll = useNoxSetting(state => state.incSongListScrollCounter);
  const progressEmitter = useNoxSetting(
    state => state.searchBarProgressEmitter,
  );
  const { playAsSearchList } = usePlayback();

  const fontColor = playerStyle.colors.primary;
  const onPress = async (item: YTSongRowCard) => {
    navigationGlobal.navigate({
      route: NoxRoutes.PlayerHome,
      options: { screen: NoxRoutes.Playlist },
    });
    progressEmitter(100);
    const playlist = await item.getPlaylist();
    playAsSearchList({
      songs: playlist.songs,
      song: playlist.item,
    }).then(() => {
      progressEmitter(0);
      setTimeout(scroll, 500);
    });
  };

  return (
    <View
      style={{
        width: Dimensions.get('window').width,
        paddingLeft: 5,
        paddingBottom: 10,
      }}
    >
      {title && (
        <Text style={{ fontSize: 20, color: fontColor, paddingBottom: 5 }}>
          {title}
        </Text>
      )}
      <FlatList
        showsHorizontalScrollIndicator={false}
        data={songs}
        horizontal
        renderItem={({ item }) => (
          <View style={styles.albumContainer}>
            <TouchableOpacity onPress={() => onPress(item)}>
              <Image
                style={styles.albumImage}
                source={{ uri: item.cover }}
                resizeMode={'cover'}
                resize={140}
              />
              <View style={{ flex: 1 }}>
                <Text
                  style={{
                    color: fontColor,
                    paddingLeft: 5,
                    width: 140,
                  }}
                  variant="titleMedium"
                  numberOfLines={item.singer ? 1 : 2}
                >
                  {item.name}
                </Text>
                {item.singer && (
                  <Text
                    style={{
                      color: playerStyle.colors.secondary,
                      paddingLeft: 5,
                      width: 140,
                    }}
                    variant="titleSmall"
                    numberOfLines={1}
                  >
                    {item.singer}
                  </Text>
                )}
              </View>
            </TouchableOpacity>
          </View>
        )}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  flex: { flex: 1 },
  albumImage: { width: 140, height: 140, borderRadius: 5 },
  albumContainer: { paddingHorizontal: 5, flex: 1 },
});
