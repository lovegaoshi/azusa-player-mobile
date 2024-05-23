import * as React from "react";
import { View } from "react-native";

import { styles } from "../style";
import BiliSearchbar from "./BiliSearch/BiliSearchbar";
import PlaylistList from "./SongList/SongList";
import { useNoxSetting } from "@stores/useApp";

const Playlist = () => {
  const playerStyle = useNoxSetting((state) => state.playerStyle);

  return (
    <View
      style={[
        styles.contentContainer,
        { backgroundColor: playerStyle.customColors.maskedBackgroundColor },
      ]}
    >
      <BiliSearchbar
        onSearched={(songs: NoxMedia.Song[]) => console.log(songs)}
      />
      <PlaylistList />
    </View>
  );
};

export default Playlist;
