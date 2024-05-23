import React, { useEffect } from "react";
import { SafeAreaView, StatusBar, View } from "react-native";

import TrackInfo from "./TrackInfo/TrackInfo";
import PlayerTopInfo from "./PlayerTopInfo";
import { useNoxSetting } from "@stores/useApp";
import useActiveTrack from "@hooks/useActiveTrack";

export default ({ navigation }: NoxComponent.NavigationProps) => {
  const { track, updateTrack } = useActiveTrack();
  const playerStyle = useNoxSetting((state) => state.playerStyle);
  const setUpdateTrack = useNoxSetting((state) => state.setUpdateTrack);

  useEffect(() => setUpdateTrack(updateTrack), []);

  return (
    <SafeAreaView style={playerStyle.screenContainer}>
      <StatusBar barStyle={"light-content"} />
      <View style={playerStyle.contentContainer}>
        <PlayerTopInfo navigation={navigation} />
        <TrackInfo track={track} />
      </View>
    </SafeAreaView>
  );
};
