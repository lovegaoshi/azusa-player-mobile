import { useEffect, useState } from "react";
import { getColors } from "react-native-image-colors";
import { colord } from "colord";

import useActiveTrack from "./useActiveTrack";
import { useNoxSetting } from "@stores/useApp";
import { replaceStyleColor } from "@components/style";
import logger from "@utils/Logger";

export default (replaceStyle = false) => {
  const playerStyle = useNoxSetting((state) => state.playerStyle);
  const setPlayerStyle = useNoxSetting((state) => state.setPlayerStyle);
  const playerSetting = useNoxSetting((state) => state.playerSetting);
  const [backgroundColor, setBackgroundColor] = useState<string>(
    playerStyle.colors.background,
  );
  const { track } = useActiveTrack();

  const getBackgroundColor = async () => {
    if (!playerSetting.accentColor) return;
    try {
      if (track?.artwork) {
        const color = await getColors(track?.artwork, {});
        const resolvedColor =
          color.platform === "ios" ? color.primary : color.dominant;
        const parsedColor = colord(resolvedColor);
        setBackgroundColor(resolvedColor);
        if (replaceStyle) {
          setPlayerStyle(
            replaceStyleColor({
              playerStyle,
              primaryColor: resolvedColor,
              secondaryColor: parsedColor.lighten(0.2).toRgbString(),
              contrastColor: parsedColor.invert().toRgbString(),
            }),
          );
        }
      }
    } catch (e) {
      logger.warn(e);
      setBackgroundColor(playerStyle.colors.background);
    }
  };

  useEffect(() => {
    getBackgroundColor();
  }, [track]);

  useEffect(() => {
    setBackgroundColor(playerStyle.colors.background);
  }, [playerStyle]);

  return { backgroundColor };
};
