import * as cheerio from 'cheerio';
import bFetch from '../BiliFetch';
import logger from '../Logger';

const _getWebid = async (mid: string) => {
  const req = await bFetch(`https://space.bilibili.com/${mid}/dynamic`);
  const parser = cheerio.load(await req.text());
  // HACK: i still cant figure out regex. this will work...
  const script = parser('script');
  const extractedScript = script
    .get()
    .find(x => x.attribs.id === '__RENDER_DATA__')?.children[0] // @ts-expect-error
    .data as string;
  const extractedJSON = JSON.parse(decodeURIComponent(extractedScript));
  return extractedJSON.access_id as string;
};

export const getWebid = async (mid: string) => {
  try {
    return `&w_webid=${await _getWebid(mid)}`;
  } catch {
    logger.warn('[biliWebId] failed to parse webid.');
    return '';
  }
};
