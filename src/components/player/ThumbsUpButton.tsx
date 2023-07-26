import React from 'react';
import { Linking, StyleSheet, View } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';
import { IconButton } from 'react-native-paper';
import RNSvgaPlayer from 'react-native-svga-player';

import {
  checkBVLiked,
  sendBVLike,
  sendBVTriple,
} from '@utils/Bilibili/BiliOperate';
import { useNoxSetting } from 'hooks/useSetting';
import { logger } from '@utils/Logger';

enum THUMBUPSTATUS {
  notLoggedIn = 'web-cancel',
  notThumbedUp = 'thumb-up-outline',
  ThumbedUp = 'thumb-up',
  // TODO: make this not stupid....
  Tripled = 'star-face',
}

// TODO: can be a util function
const checkLiked = async (song: NoxMedia.Song | undefined) => {
  if (!song) {
    return 0;
  }
  if (song.bvid.startsWith('BV')) {
    // if (!Number.isNaN(Number(song.id))) {
    // legacy bilivideo where id is cid and bvid is bvid
    return await checkBVLiked(song.bvid);
  }
};

const go2SongURL = async (song: NoxMedia.Song) => {
  const url = `https://www.bilibili.com/video/${song.bvid}`;
  await Linking.openURL(url);
};

const ThumbsUpButton = () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const [status, setStatus] = React.useState<THUMBUPSTATUS>(
    THUMBUPSTATUS.notLoggedIn
  );
  const [currentTrack, setCurrentTrack] = React.useState<Track | undefined>(
    undefined
  );
  const [svgaVisible, setSvgaVisible] = React.useState(false);

  const onClick = async (triple = false) => {
    if (!currentTrack?.song) return;
    setSvgaVisible(true);
    switch (status) {
      case THUMBUPSTATUS.notThumbedUp:
        sendBVLike(currentTrack.song.bvid).then(res => {
          if (res.code === 0) setStatus(THUMBUPSTATUS.ThumbedUp);
        });
        break;
      case THUMBUPSTATUS.ThumbedUp:
        if (triple) {
          // TODO: use that starred lottie animation
          sendBVTriple(currentTrack.song.bvid).then(res => {
            if (res.code === 0) setStatus(THUMBUPSTATUS.Tripled);
          });
        }
        break;
      default:
        if (currentTrack?.song) {
          go2SongURL(currentTrack?.song);
        }
    }
  };

  React.useEffect(() => {
    const setLikedStatus = async () => {
      const track = await TrackPlayer.getActiveTrack();
      setCurrentTrack(track);
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
  }, [currentPlayingId]);

  return (
    <View>
      {svgaVisible && playerStyle.thumbupSVGA && (
        <RNSvgaPlayer
          style={styles.svgaButton}
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
        mode={playerStyle.playerControlIconContained}
        size={30}
        style={{
          backgroundColor: playerStyle.customColors.btnBackgroundColor,
          zIndex: 1,
        }}
        disabled={status === THUMBUPSTATUS.notLoggedIn}
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
