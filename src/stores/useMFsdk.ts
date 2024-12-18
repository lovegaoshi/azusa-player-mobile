import { StateCreator } from 'zustand';

import { MFsdk } from '@utils/mediafetch/evalsdk';
import { getUniqObjects } from '@utils/Utils';
import { rmMFsdks, addMFsdks } from '@utils/mfsdk';

export interface MFsdkStore {
  MFsdks: MFsdk[];
  setMFsdks: (mf: MFsdk[]) => void;
  addMFsdks: (mf: MFsdk[]) => void;
  removeMFsdk: (mf: MFsdk) => void;
}

const store: StateCreator<MFsdkStore, [], [], MFsdkStore> = (set, get) => ({
  MFsdks: [],
  setMFsdks: mf => set({ MFsdks: mf }),
  addMFsdks: mf => {
    addMFsdks(mf.map(v => v.path));
    set(s => ({
      MFsdks: getUniqObjects([...mf, ...s.MFsdks], sdk => sdk.srcUrl),
    }));
  },
  removeMFsdk: mf => {
    const { MFsdks } = get();
    rmMFsdks(MFsdks.filter(v => v.srcUrl === mf.srcUrl).map(v => v.path));
    set(s => ({
      MFsdks: s.MFsdks.filter(v => v.srcUrl !== mf.srcUrl),
    }));
  },
});

export default store;
