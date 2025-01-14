/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable prefer-const */
import { create } from 'zustand';

import createBottomTab, { BottomTabStore } from './useBottomTab';
import createAndroidAuto, { AndroidAutoStore } from './useAndroidAuto';

interface NoxMobile extends BottomTabStore, AndroidAutoStore {}

/**
 * store manager of noxplayer. exposes state setter and getter functions,
 * as well as saving and loading states to/from asyncStorage.
 */
export default create<NoxMobile>((set, get, storeApi) => ({
  ...createBottomTab(set, get, storeApi),
  ...createAndroidAuto(set, get, storeApi),
}));
