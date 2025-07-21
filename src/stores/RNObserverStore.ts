import { create } from 'zustand';
import TrackPlayer from 'react-native-track-player';

interface Store {
  RNTPPlay: number;
  RNTPSeek: number;
}

const store = create<Store>(() => ({ RNTPPlay: 0, RNTPSeek: 0 }));

export default store;

export const TPSeek = (position: number) => {
  store.setState(v => ({ RNTPSeek: v.RNTPSeek + 1 }));
  return TrackPlayer.seekTo(position);
};
export const TPPlay = () => {
  store.setState(v => ({ RNTPPlay: v.RNTPPlay + 1 }));
  return TrackPlayer.play();
};
