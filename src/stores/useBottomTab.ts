import { StateCreator } from 'zustand';

import { BottomTabRouteIcons } from '@enums/BottomTab';

export interface BottomTabStore {
  bottomTabRoute: BottomTabRouteIcons;
  bottomTabRouteP: BottomTabRouteIcons;
  setBottomTabRoute: (val: BottomTabRouteIcons) => void;
  toggleBottomTabDrawer: () => void;
}

const store: StateCreator<BottomTabStore, [], [], BottomTabStore> = (
  set,
  get,
) => ({
  bottomTabRoute: BottomTabRouteIcons.music,
  bottomTabRouteP: BottomTabRouteIcons.music,
  setBottomTabRoute: val =>
    set(s => ({ bottomTabRoute: val, bottomTabRouteP: s.bottomTabRoute })),
  toggleBottomTabDrawer: () => {
    const { bottomTabRoute, bottomTabRouteP, setBottomTabRoute } = get();
    setBottomTabRoute(
      bottomTabRoute === BottomTabRouteIcons.playlist
        ? bottomTabRouteP
        : BottomTabRouteIcons.playlist,
    );
  },
});

export default store;
