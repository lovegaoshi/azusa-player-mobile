// vanilla store of zustand serving playbackServices.
import { createStore } from 'zustand/vanilla';
import { NoxRepeatMode } from '@/components/player/enums/RepeatMode';

interface NoxVanillaSetting {
    playingList: Array<NoxMedia.Song>;
    playingListShuffled: Array<NoxMedia.Song>;
}

export default createStore<NoxVanillaSetting>(() => ({
    playingList: [],
    playingListShuffled: [],
}))

// const { getState, setState } =