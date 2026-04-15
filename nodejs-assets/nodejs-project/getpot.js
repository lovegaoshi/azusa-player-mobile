import { BG } from 'bgutils-js';
import { JSDOM } from 'jsdom';

const requestKey = 'O43z0dpjhgX20SCx4KAo';

export const getPot = async identifier => {
  const dom = new JSDOM(
    '<!DOCTYPE html><html lang="en"><head><title></title></head><body></body></html>',
    {
      url: 'https://www.youtube.com/',
      referrer: 'https://www.youtube.com/',
      userAgent:
        'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:148.0) Gecko/20100101 Firefox/148.0',
    },
  );

  Object.defineProperty(dom.window.HTMLCanvasElement.prototype, 'getContext', {
    value: () => null,
    writable: true,
    configurable: true,
  });

  Object.assign(globalThis, {
    window: dom.window,
    document: dom.window.document,
    location: dom.window.location,
    origin: dom.window.origin,
    dispatchEvent: dom.window.dispatchEvent.bind(dom.window),
  });

  const challengeReq = await fetch(
    'https://www.youtube.com/youtubei/v1/att/get?prettyPrint=false&alt=json',
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        host: 'www.youtube.com',
      },
      body: JSON.stringify({
        engagementType: 'ENGAGEMENT_TYPE_UNBOUND',
        context: {
          client: {
            clientName: 'WEB',
            clientVersion: '2.20260325.08.00',
          },
        },
      }),
    },
  );
  const challengeResponse = await challengeReq.json();
  if (!challengeResponse.bgChallenge)
    throw new Error('Could not get challenge');

  const interpreterUrl =
    challengeResponse.bgChallenge.interpreterUrl
      .privateDoNotAccessOrElseTrustedResourceUrlWrappedValue;
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
    program: challengeResponse.bgChallenge.program,
    globalName: challengeResponse.bgChallenge.globalName,
    bgConfig,
  });

  return poTokenResult;
};
