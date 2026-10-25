import { EventSubscription } from 'react-native';

export enum Events {
  ProgressUpdated = 'progressUpdated',
  PlaybackActiveTrackChanged = 'playbackActiveTrackChanged',
}

export const eventListeners: Partial<Record<Events, EventSubscription>> = {};
