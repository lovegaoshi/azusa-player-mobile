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

global.CustomEvent = CustomEvent as any;

// === END === Making Youtube.js work

let ytClient: undefined | Innertube;
let ytWebClient: undefined | Innertube;

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

export const ytClientWeb = async () => {
  if (ytWebClient !== undefined) {
    return ytWebClient;
  }
  const cookie = await getItem(StorageKeys.YTMCOOKIES, undefined);
  ytWebClient = await Innertube.create({
    retrieve_player: false,
    enable_session_cache: false,
    generate_session_locally: false,
    cookie,
    fetch: (url, init) => {
      // @ts-expect-error this headers is actually a map
      init?.headers?.set('origin', 'https://www.youtube.com');
      return fetch(url, init);
    },
  });
  return ytWebClient!;
};
