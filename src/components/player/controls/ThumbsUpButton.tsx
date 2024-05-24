import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import { IconButton } from 'react-native-paper';
import RNSvgaPlayer from 'react-native-svga-player';

import {
  checkBVLiked,
  sendBVLike,
  sendBVTriple,
} from '@utils/Bilibili/BiliOperate';
import { useNoxSetting } from '@stores/useApp';
import { logger } from '@utils/Logger';
import useActiveTrack from '@hooks/useActiveTrack';

enum THUMBUPSTATUS {
  notLoggedIn = 'web-cancel',
  notThumbedUp = 'thumb-up-outline',
  ThumbedUp = 'thumb-up',
  // TODO: make this not stupid....
  Tripled = 'star-face',
}

// TODO: can be a util function
const checkLiked = (song?: NoxMedia.Song) => {
  if (!song) return;
  if (song.bvid?.startsWith?.('BV')) {
    // if (!Number.isNaN(Number(song.id))) {
    // legacy bilivideo where id is cid and bvid is bvid
    return checkBVLiked(song.bvid);
  }
};

const go2SongURL = (song: NoxMedia.Song) => {
  const url = `https://www.bilibili.com/video/${song.bvid}`;
  return Linking.openURL(url);
};

interface Props {
  iconSize?: number;
}
const ThumbsUpButton = ({ iconSize = 30 }: Props) => {
  const { track } = useActiveTrack();
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const [status, setStatus] = React.useState<THUMBUPSTATUS>(
    THUMBUPSTATUS.notLoggedIn
  );
  const [svgaVisible, setSvgaVisible] = React.useState(false);

  const onClick = async (triple = false) => {
    if (!track?.song) return;
    setSvgaVisible(true);
    switch (status) {
      case THUMBUPSTATUS.notThumbedUp:
        sendBVLike(track.song.bvid).then(res => {
          if (res.code === 0) setStatus(THUMBUPSTATUS.ThumbedUp);
        });
        break;
      case THUMBUPSTATUS.ThumbedUp:
        if (triple) {
          // TODO: use that starred lottie animation
          sendBVTriple(track.song.bvid).then(res => {
            if (res.code === 0) setStatus(THUMBUPSTATUS.Tripled);
          });
        }
        break;
      default:
        if (track?.song) {
          go2SongURL(track?.song);
        }
    }
  };

  React.useEffect(() => {
    const setLikedStatus = async () => {
      if (!track || !track.song) {
        setStatus(THUMBUPSTATUS.notLoggedIn);
        return;
      }
      const liked = await checkLiked(track.song);
      logger.log(`[biliThumbup] liked: ${liked}`);
      if (liked === undefined) {
        setStatus(THUMBUPSTATUS.notLoggedIn);
      } else if (liked) {
        setStatus(THUMBUPSTATUS.ThumbedUp);
      } else {
        setStatus(THUMBUPSTATUS.notThumbedUp);
      }
    };
    setLikedStatus();
  }, [track]);

  return (
    <View>
      {svgaVisible && playerStyle.thumbupSVGA && (
        <RNSvgaPlayer
          style={[styles.svgaButton, { zIndex: playerStyle.thumbupZIndex }]}
          source={playerStyle.thumbupSVGA}
          onPercentage={val => {
            if (val > 0.9) setSvgaVisible(false);
          }}
        />
      )}
      <IconButton
        icon={status}
        onPress={() => onClick()}
        // TODO: use moti to make animation on triple
        // https://github.com/nandorojo/moti/discussions/148
        onLongPress={() => onClick(true)}
        // mode={playerStyle.playerControlIconContained}
        size={iconSize}
        style={{
          // backgroundColor: playerStyle.customColors.btnBackgroundColor,
          zIndex: 1,
        }}
        disabled={status === THUMBUPSTATUS.notLoggedIn}
        theme={{ colors: { onSurfaceVariant: playerStyle.colors.primary } }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  svgaButton: {
    width: 178,
    height: 178,
    position: 'absolute',
    top: -110,
    left: -60,
  },
});
export default ThumbsUpButton;
