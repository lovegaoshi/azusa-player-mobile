export const DEFAULT_UA =
  'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.62';

interface props {
  method: string;
  headers: any;
  body: any | undefined;
}

export default async function BiliFetch(
  url: string,
  params: props = {
    method: 'GET',
    headers: {},
    body: undefined,
  }
) {
  if (Object.entries(params.headers).length === 0) {
    params.headers = customReqHeader(url, params.headers);
  }
  if (!params.headers['User-Agent']) {
    params.headers['User-Agent'] = DEFAULT_UA;
  }
  return fetch(url, params);
}

/**
 *
 * @param url
 * @param reqHeader
 * @returns
 */
export const customReqHeader = (
  url: string,
  reqHeader: { [key: string]: any }
) => {
  if (/bilibili/.exec(url) || /bilivideo/.exec(url)) {
    reqHeader.referer = 'https://www.bilibili.com/';
    reqHeader['User-Agent'] = DEFAULT_UA;
  }
  return reqHeader;
};

/**
 * ?
  fetch('https://api.bilibili.com/x/click-interface/click/web/h5', {
    method: 'POST',
    headers:{
    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/111.0.0.0 Safari/537.36 Edg/111.0.1661.62',
    'Content-Type': 'application/x-www-form-urlencoded',
    referer:'https://www.bilibili.com',
    origin:'https://www.bilibili.com',
    },
    body: new URLSearchParams({
      bvid:"BV1BM4y1b7TR",
      cid:1123104684
    })
  }).then(res => res.json().then(val => console.log(val)))
 */