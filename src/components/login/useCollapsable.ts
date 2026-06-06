// HACK: tried to make this a hook but children/webview will refresh. but why?
// is react18 solving this mess?
import { create } from 'zustand';

interface TimerStore {
  collapse: boolean;
  setCollapse: (val: boolean) => void;
  toggleCollapse: (v?: boolean) => void;
}
export default create<TimerStore>((set, get) => ({
  collapse: false,
  setCollapse: (val: boolean) => set({ collapse: val }),
  toggleCollapse: v => set({ collapse: v === undefined ? !get().collapse : v }),
}));
