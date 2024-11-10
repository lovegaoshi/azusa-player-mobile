import * as React from 'react';
import { View, Dimensions, FlatList, TouchableOpacity } from 'react-native';
import { Text } from 'react-native-paper';
import { Image } from 'expo-image';

import { useNoxSetting } from '@stores/useApp';
import usePlayback from '@hooks/usePlayback';
import { NoxRoutes } from '@enums/Routes';
import { BiliSongCardProp } from './SongTab';
import useNavigation from '@hooks/useNavigation';

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
          <View style={{ paddingHorizontal: 5, flex: 1 }}>
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
                style={{ width: 140, height: 140, borderRadius: 5 }}
                source={{ uri: item.cover }}
              />
              <View style={{ flex: 1 }}>
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

interface YTSongRowCard {
  cover: string;
  name: string;
  singer?: string;
  getPlaylist: () => Promise<{ songs: NoxMedia.Song[]; item?: NoxMedia.Song }>;
}

interface YTSongRowProp {
  songs?: YTSongRowCard[];
  title?: string;
}

// TODO: abstract as a parent class to above
export const YTSongRow = ({ songs = [], title }: YTSongRowProp) => {
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
          <View style={{ paddingHorizontal: 5, flex: 1 }}>
            <TouchableOpacity
              onPress={async () => {
                navigationGlobal.navigate({
                  route: NoxRoutes.PlayerHome,
                  options: { screen: NoxRoutes.Playlist },
                });
                const playlist = await item.getPlaylist();
                playAsSearchList({
                  songs: playlist.songs,
                  song: playlist.item,
                }).then(() => setTimeout(scroll, 500));
              }}
            >
              <Image
                style={{ width: 140, height: 140, borderRadius: 5 }}
                source={{ uri: item.cover }}
              />
              <View style={{ flex: 1 }}>
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
