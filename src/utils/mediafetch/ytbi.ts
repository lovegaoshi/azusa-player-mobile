// === START ===  Making Youtube.js work
import 'event-target-polyfill';
import 'web-streams-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import { decode, encode } from 'base-64';
import { Innertube, ClientType } from 'youtubei.js';

import MMKV from '../fakeMMKV';

if (!global.btoa) {
  global.btoa = encode;
}

if (!global.atob) {
  global.atob = decode;
}

// @ts-expect-error to avoid typings' fuss
global.mmkvStorage = MMKV as any;

// See https://github.com/nodejs/node/issues/40678#issuecomment-1126944677
class CustomEvent extends Event {
  #detail;

  // @ts-expect-error to avoid typings' fuss
  constructor(type: string, options?: CustomEventInit<any[]>) {
    super(type, options);
    this.#detail = options?.detail ?? null;
  }

  get detail() {
    return this.#detail;
  }
}

// @ts-expect-error to avoid typings' fuss
global.CustomEvent = CustomEvent as any;

// === END === Making Youtube.js work

const ytClient: Promise<Innertube> = Innertube.create({
  retrieve_player: false,
  enable_session_cache: false,
  generate_session_locally: false,
  client_type: ClientType.IOS,
});

export default ytClient;

export const ytClientWeb: Promise<Innertube> = Innertube.create({
  retrieve_player: false,
  enable_session_cache: false,
  generate_session_locally: false,
});

export const awaitYtbiSetup = async () => {
  const startTime = new Date().getTime();
  await ytClient;
  await ytClientWeb;
  console.log('[perf] ytbi setup took', new Date().getTime() - startTime, 'ms');
};
