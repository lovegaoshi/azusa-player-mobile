import React from "react";
import TrackPlayer, { Track, useActiveTrack } from "react-native-track-player";

const useTrack = () => {
  const activeTrack = useActiveTrack();
  const [track, setTrack] = React.useState<Track | undefined>(activeTrack);

  const updateTrack = async (metadata: Partial<Track> = {}) => {
    const index = await TrackPlayer.getActiveTrackIndex();
    if (index === undefined) return;
    await TrackPlayer.updateMetadataForTrack(index, metadata);
    const queue = await TrackPlayer.getQueue();
    setTrack({ ...queue[index] });
  };

  React.useEffect(() => setTrack(activeTrack), [activeTrack]);

  return { track, updateTrack };
};

export default useTrack;
