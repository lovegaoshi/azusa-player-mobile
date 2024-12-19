import { StateCreator } from 'zustand';

import { MFsdk } from '@utils/mediafetch/evalsdk';
import { getUniqObjects } from '@utils/Utils';
import { rmMFsdks, addMFsdks } from '@utils/mfsdk';

export interface MFsdkStore {
  MFsdks: MFsdk[];
  setMFsdks: (mf: MFsdk[]) => void;
  addMFsdks: (mf: MFsdk[]) => void;
  rmMFsdks: (mf: MFsdk[]) => void;
  replaceMFsdks: (mf: MFsdk[]) => void;
}

const store: StateCreator<MFsdkStore, [], [], MFsdkStore> = (set, get) => ({
  MFsdks: [],
  setMFsdks: mf => set({ MFsdks: mf }),
  replaceMFsdks: mf => {
    if (mf.length === 0) return;
    set(s => ({
      MFsdks: s.MFsdks.map(sdk => mf.find(v => v.srcUrl === sdk.srcUrl) ?? sdk),
    }));
  },
  addMFsdks: mf => {
    if (mf.length === 0) return;
    addMFsdks(mf.map(v => v.path));
    set(s => ({
      MFsdks: getUniqObjects([...mf, ...s.MFsdks], sdk => sdk.srcUrl),
    }));
  },
  rmMFsdks: mf => {
    if (mf.length === 0) return;
    const { MFsdks } = get();
    const rmUrls = mf.map(v => v.srcUrl);
    rmMFsdks(MFsdks.filter(v => rmUrls.includes(v.srcUrl)).map(v => v.path));
    set(s => ({
      MFsdks: s.MFsdks.filter(v => !rmUrls.includes(v.srcUrl)),
    }));
  },
});

export default store;
