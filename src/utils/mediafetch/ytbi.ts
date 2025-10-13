// === START ===  Making Youtube.js work
import 'event-target-polyfill';
import { TransformStream } from 'web-streams-polyfill';
import 'text-encoding-polyfill';
import 'react-native-url-polyfill/auto';
import { Innertube, ClientType, Platform } from 'youtubei.js';
import { getSecure as getItem } from '@utils/ChromeStorageAPI';
import { BuildScriptResult, VMPrimative } from 'youtubei.js/dist/src/types';
import { BG, BgConfig } from 'bgutils-js';
import { jsdom } from 'jsdom-jscore-rn';

import { timeFunction } from '../Utils';
import MMKV, { GHCacher } from '../fakeMMKV';
import { StorageKeys } from '@enums/Storage';
import logger from '../Logger';

if (typeof global.TransformStream === 'undefined') {
  // @ts-expect-error
  global.TransformStream = TransformStream;
}

Platform.shim.eval = async (
  data: BuildScriptResult,
  env: Record<string, VMPrimative>,
) => {
  const properties = [];

  if (env.n) {
    properties.push(`n: exportedVars.nFunction("${env.n}")`);
  }

  if (env.sig) {
    properties.push(`sig: exportedVars.sigFunction("${env.sig}")`);
  }

  const code = `${data.output}\nreturn { ${properties.join(', ')} }`;

  return new Function(code)();
};

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
const requestKey = 'O43z0dpjhgX20SCx4KAo';

const generatePOToken = async () => {
  const webClient = await ytwebClient();
  const visitorData = webClient.session.context.client.visitorData!;
  const dom = jsdom();
  console.log('APMdebugdom', dom, dom.window, dom.window?.document);
  console.log('APMdebugvisitor', visitorData);
  const bgConfig: BgConfig = {
    fetch: (input: string | URL | globalThis.Request, init?: RequestInit) =>
      fetch(input, init),
    globalObj: globalThis,
    identifier: visitorData,
    requestKey,
  };
  const bgChallenge = await BG.Challenge.create(bgConfig);
  const interpreterJavascript =
    bgChallenge!.interpreterJavascript
      .privateDoNotAccessOrElseSafeScriptWrappedValue;
  console.log('APMdebugJScode', interpreterJavascript);
  if (interpreterJavascript === null) {
    return;
  }
  new Function(interpreterJavascript)();
  console.log('APMdebugJScoderan');
  try {
    const poTokenResult = await BG.PoToken.generate({
      program: bgChallenge!.program,
      globalName: bgChallenge!.globalName,
      bgConfig,
    });
    const placeholderPoToken = BG.PoToken.generateColdStartToken(visitorData);
    console.log('APMdebugPOTOKEN', poTokenResult, placeholderPoToken);
    return poTokenResult.poToken;
  } catch (e) {
    console.error(e);
  }
};

const createYtClient = async () => {
  return Innertube.create({
    cache: new GHCacher(),
    retrieve_player: true,
    enable_session_cache: false,
    generate_session_locally: false,
    client_type: ClientType.IOS,
    po_token: await generatePOToken(),
    //cookie,
  });
};

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
  const cookie = await getItem(StorageKeys.YTMCOOKIES);
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
  const cookie = await getItem(StorageKeys.YTMCOOKIES);
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
