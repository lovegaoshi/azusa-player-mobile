import { StateCreator } from 'zustand';

// zustand store slice template.

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface Slice {}

const store: StateCreator<Slice, [], [], Slice> = set => ({});

export default store;
