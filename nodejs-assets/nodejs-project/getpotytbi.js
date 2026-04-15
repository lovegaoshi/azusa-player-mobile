import { BG } from 'bgutils-js';
import { JSDOM } from 'jsdom';
import { Innertube, UniversalCache } from 'youtubei.js';

const requestKey = 'O43z0dpjhgX20SCx4KAo';

export const getPot = async identifier => {
  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>',
    {
      url: 'https://www.youtube.com',
      referrer: 'https://www.youtube.com/',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0',
    },
  );

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    origin: dom.window.origin,
    dispatchEvent: dom.window.dispatchEvent.bind(dom.window),
  });

  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', {
    value: () => null,
    writable: true,
    configurable: true,
  });

  const innertube = await Innertube.create({ cache: new UniversalCache(true) });
  const challengeResponse = await innertube.getAttestationChallenge(
    'ENGAGEMENT_TYPE_UNBOUND',
  );
  if (!challengeResponse.bg_challenge)
    throw new Error('Could not get challenge');

  const interpreterUrl =
    challengeResponse.bg_challenge.interpreter_url
      .private_do_not_access_or_else_trusted_resource_url_wrapped_value;

  const bgScriptResponse = await fetch(`https:${interpreterUrl}`);
  const interpreterJavascript = await bgScriptResponse.text();

  if (interpreterJavascript) {
    new Function(interpreterJavascript)();
  } else throw new Error('Could not load VM');

  const bgConfig = {
    fetch: fetch,
    globalObj: globalThis,
    identifier,
    requestKey,
  };
  const poTokenResult = await BG.PoToken.generate({
    program: challengeResponse.bg_challenge.program,
    globalName: challengeResponse.bg_challenge.global_name,
    bgConfig,
  });

  return poTokenResult;
};

// const {getPot} = await import('./getpotytbi.js'); getPot('g6k55WQ5GAk')
