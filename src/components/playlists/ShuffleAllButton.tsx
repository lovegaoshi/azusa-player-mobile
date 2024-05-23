import React from "react";
import { IconButton } from "react-native-paper";
import { useNavigation } from "@react-navigation/native";
import { NoxRoutes } from "@enums/Routes";
import usePlayback from "@hooks/usePlayback";

export default () => {
  const navigation = useNavigation();
  const { shuffleAll } = usePlayback();
  const onPressed = async () => {
    await shuffleAll();
    navigation.navigate(NoxRoutes.PlayerHome as never);
  };

  return <IconButton icon="shuffle" onPress={onPressed} />;
};
