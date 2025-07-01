// helper hook that gets only the MV from activeTrack

import { useTrackStore } from '@hooks/useActiveTrack';

export default () => {
  const track = useTrackStore(s => s.track);
  const song = track?.song as NoxMedia.Song;

  let parsedMusicVideo = undefined;
  try {
    parsedMusicVideo = JSON.parse(song?.musicVideo ?? '');
  } catch {}

  // return { type: RESOLVE_TYPE.bvid, identifier: 'BV1Ei4y1b78A' };
  return parsedMusicVideo ?? {};
};
