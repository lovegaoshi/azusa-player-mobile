import { StateCreator } from 'zustand';

import { BottomTabRouteIcons } from '@enums/BottomTab';

export interface BottomTabStore {
  bottomTabRoute: BottomTabRouteIcons;
  bottomTabRouteP: BottomTabRouteIcons;
  setBottomTabRoute: (val: BottomTabRouteIcons) => void;
  toggleBottomTabDrawer: () => void;
}

const bottomTabStore: StateCreator<BottomTabStore, [], [], BottomTabStore> = (
  set,
  get,
) => ({
  bottomTabRoute: BottomTabRouteIcons.music,
  bottomTabRouteP: BottomTabRouteIcons.music,
  setBottomTabRoute: val =>
    set({ bottomTabRoute: val, bottomTabRouteP: get().bottomTabRoute }),
  toggleBottomTabDrawer: () => {
    const { bottomTabRoute, bottomTabRouteP, setBottomTabRoute } = get();
    setBottomTabRoute(
      bottomTabRoute === BottomTabRouteIcons.playlist
        ? bottomTabRouteP
        : BottomTabRouteIcons.playlist,
    );
  },
});

export default bottomTabStore;
