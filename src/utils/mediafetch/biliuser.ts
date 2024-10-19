import * as cheerio from 'cheerio';

import { wbiQuery } from '@stores/wbi';
import { getDm } from '../Bilibili/bilidm';
import bFetch from '../BiliFetch';

const API = 'https://api.bilibili.com/x/space/wbi/acc/info?mid={mid}';

export const getBiliUser = async (mid: string) => {
  const res = await wbiQuery(
    API.replace('{mid}', mid) + `${getDm()}&w_webid=${await getWebid(mid)}`,
  );
  const json = await res.json();
  return json.data;
};

const getWebid = async (mid: string) => {
  const req = await bFetch(`https://space.bilibili.com/${mid}/dynamic`);
  const parser = cheerio.load(await req.text());
  // HACK: i still cant figure out regex. this will work...
  const script = parser('script');
  const extractedScript = script
    .get()
    .filter(x => x.attribs.id === '__RENDER_DATA__')[0].children[0] // @ts-expect-error
    .data as string;
  const extractedJSON = JSON.parse(decodeURIComponent(extractedScript));
  return extractedJSON.access_id as string;
};
