import React from 'react';
import { Linking } from 'react-native';
import TrackPlayer, { Track } from 'react-native-track-player';
import { IconButton } from 'react-native-paper';
import CookieManager from '@react-native-cookies/cookies';
import {
  checkBVLiked,
  sendBVLike,
  sendBVTriple,
} from '../../utils/BiliOperate';
import { useNoxSetting } from '../../hooks/useSetting';
import { logger } from '../../utils/Logger';

enum THUMBUPSTATUS {
  notLoggedIn = 'web-cancel',
  notThumbedUp = 'thumb-up-outline',
  ThumbedUp = 'thumb-up',
}

// TODO: can be a util function
const checkLiked = async (song: NoxMedia.Song | undefined) => {
  if (!song) {
    return 0;
  }
  if (!Number.isNaN(Number(song.id))) {
    // legacy bilivideo where id is cid and bvid is bvid
    return await checkBVLiked(song.bvid);
  }
};

const go2SongURL = async (song: NoxMedia.Song | undefined) => {
  if (!song) return;
  const url = `https://www.bilibili.com/video/${song.bvid}`;
  await Linking.openURL(url);
};

export default () => {
  const playerStyle = useNoxSetting(state => state.playerStyle);
  const currentPlayingId = useNoxSetting(state => state.currentPlayingId);
  const [status, setStatus] = React.useState<THUMBUPSTATUS>(
    THUMBUPSTATUS.notLoggedIn
  );
  const [currentTrack, setCurrentTrack] = React.useState<Track | undefined>(
    undefined
  );

  const onClick = async () => {
    if (!currentTrack?.song) return;
    switch (status) {
      case THUMBUPSTATUS.notThumbedUp:
        sendBVLike(currentTrack.song.bvid).then(val =>
          console.log('bvlike', val)
        );
        break;
      default:
        go2SongURL(currentTrack?.song);
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
      if (liked) {
        setStatus(THUMBUPSTATUS.ThumbedUp);
      } else {
        setStatus(THUMBUPSTATUS.notThumbedUp);
      }
      console.log('like set');
    };
    setLikedStatus();
  }, [currentPlayingId]);

  return (
    <IconButton
      icon={status}
      onPress={onClick}
      mode={playerStyle.playerControlIconContained}
      size={30}
      style={{
        backgroundColor: playerStyle.customColors.btnBackgroundColor,
      }}
      disabled={status === THUMBUPSTATUS.notLoggedIn}
    />
  );
};
