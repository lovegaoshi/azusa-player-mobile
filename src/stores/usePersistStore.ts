import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from 'expo-sqlite/kv-store';

import { Site } from '@enums/Network';

/**
 * a persist store that hopes to reduce the amount of boilerplates im already doing.
 * TODO: migrate to this store
 */
interface APMAppStore {
  loginPage: Site;
  setLoginPage: (site: Site) => void;
  explorePage: Site;
  setExplorePage: (site: Site) => void;
}

export const useAPM = create<APMAppStore>()(
  persist(
    set => ({
      loginPage: Site.Bilibili,
      setLoginPage: (site: Site) => set({ loginPage: site }),

      explorePage: Site.Bilibili,
      setExplorePage: (site: Site) => set({ explorePage: site }),
    }),
    {
      name: 'APMStore',
      storage: createJSONStorage(() => AsyncStorage),
    },
  ),
);
