// === START ===  Making Youtube.js work
import 'event-target-polyfill';
import 'web-streams-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import { decode, encode } from 'base-64';
import { Innertube, ClientType } from 'youtubei.js';
import { getSecure as getItem } from '@utils/ChromeStorageAPI';

import { timeFunction } from '../Utils';
import MMKV from '../fakeMMKV';
import { StorageKeys } from '@enums/Storage';
import logger from '../Logger';

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

let ytClient: undefined | Innertube;

const createYtClient = () =>
  getItem(StorageKeys.YTMCOOKIES, undefined).then(() =>
    Innertube.create({
      retrieve_player: true,
      enable_session_cache: false,
      generate_session_locally: false,
      client_type: ClientType.IOS,
      cookie: '',
      fetch: (url, init) => {
        console.log('[ytbi.js] fetch', url, init);
        init?.headers?.set('referer', 'https://www.youtube.com/');
        init?.headers?.set('x-origin', 'https://www.youtube.com');
        init?.headers?.set('origin', 'https://www.youtube.com');
        init?.headers?.set('sec-fetch-dest', 'empty');
        init?.headers?.set('sec-fetch-site', 'same-origin');
        init?.headers?.set('sec-fetch-mode', 'same-origin');
        init?.headers?.set(
          'user-agent',
          'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/109.0.0.0 Safari/537.36',
        );
        init?.credentials && (init.credentials = 'include');
        url.credentials && (url.credentials = 'include');
        url.referrer && (url.referrer = 'https://www.youtube.com/');
        console.log('[ytbi.js] fetch2', url, init);
        return fetch(url, init);
      },
    }),
  );

export default async () => {
  if (ytClient !== undefined) {
    return ytClient;
  }
  logger.debug('[ytbi.js] ytClient is initializing. takes time...');
  ytClient = (await timeFunction(createYtClient, 'ytClient init')).result;
  return ytClient!;
};

export const ytClientWeb = Innertube.create({
  retrieve_player: false,
  enable_session_cache: false,
  generate_session_locally: false,
});
