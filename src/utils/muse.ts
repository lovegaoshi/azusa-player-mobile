import { setup, MemoryStore } from 'libmuse';

import {
  getSecure as getItem,
  saveSecure as setItem,
} from '@utils/ChromeStorageAPI';

const MUSE_KEY = 'museStore';
class MyStore extends MemoryStore {
  get<T>(k: string): T | null {
    console.log(this.map, k);
    return super.get(k);
  }
  set(key: string, value: unknown) {
    super.set(key, value);
    setItem(MUSE_KEY, JSON.stringify(Object.fromEntries(this.map)));
  }
  async init() {
    const v = await getItem(MUSE_KEY);
    try {
      this.map = new Map(Object.entries(JSON.parse(v ?? '{}')));
    } catch {
      this.map = new Map();
    }
  }
}

export const museStore = new MyStore();

export const initialize = async () => {
  await museStore.init();
  setup({ store: museStore });
};
