import bfetch from '@utils/BiliFetch';
import { logger } from '@utils/Logger';

const BILI_RELATED_API =
  'https://api.bilibili.com/x/web-interface/archive/related?bvid={bvid}';
export const biliSuggest = async (bvid: string) => {
  logger.debug(`fetching biliSuggest wiht ${bvid}`);
  const res = await bfetch(BILI_RELATED_API.replace('{bvid}', bvid)),
    json = await res.json();
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return json.data as any[];
};
