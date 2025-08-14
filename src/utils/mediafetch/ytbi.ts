// === START ===  Making Youtube.js work
import 'event-target-polyfill';
import 'web-streams-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import { Innertube, ClientType, Platform } from 'youtubei.js';
import { getSecure as getItem } from '@utils/ChromeStorageAPI';

import { timeFunction } from '../Utils';
import MMKV from '../fakeMMKV';
import { StorageKeys } from '@enums/Storage';
import logger from '../Logger';

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

global.CustomEvent = CustomEvent as any;

// === END === Making Youtube.js work

let ytClient: undefined | Innertube;
let _ytWebClient: undefined | Innertube;
let _ytmClient: undefined | Innertube;

const createYtClient = () =>
  Innertube.create({
    retrieve_player: true,
    enable_session_cache: false,
    generate_session_locally: false,
    client_type: ClientType.IOS,
    //cookie,
  });

export default async () => {
  if (ytClient !== undefined) {
    return ytClient;
  }
  logger.debug('[ytbi.js] ytClient is initializing. takes time...');
  ytClient = (await timeFunction(createYtClient, 'ytClient init')).result;
  return ytClient!;
};

export const ytwebClient = async () => {
  if (_ytWebClient !== undefined) {
    return _ytWebClient;
  }
  const cookie = await getItem(StorageKeys.YTMCOOKIES, undefined);
  _ytWebClient = await Innertube.create({
    retrieve_player: false,
    enable_session_cache: false,
    generate_session_locally: false,
    cookie,
    fetch: (url, init) => {
      // @ts-expect-error this headers is actually a map
      init?.headers?.set('origin', 'https://www.youtube.com');
      return Platform.shim.fetch(url, init);
    },
  });
  return _ytWebClient!;
};

export const ytmClient = async () => {
  if (_ytmClient !== undefined) {
    return _ytmClient;
  }
  const cookie = await getItem(StorageKeys.YTMCOOKIES, undefined);
  _ytmClient = await Innertube.create({
    retrieve_player: false,
    enable_session_cache: false,
    generate_session_locally: false,
    client_type: ClientType.MUSIC,
    cookie,
    fetch: (url, init) => {
      // @ts-expect-error this headers is actually a map
      init?.headers?.set('origin', 'https://www.youtube.com');
      return fetch(url, init);
    },
  });
  return _ytmClient!;
};
