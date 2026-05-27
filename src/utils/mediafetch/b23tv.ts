import { logger } from '../Logger';
import bFetch from '../BiliFetch';

const resolveB23TV = async (url: string) => {
  logger.debug(`[b23.tv] fetching ${url}`);
  const res = await bFetch(`https://b23.tv/${url}`, {
    // method: 'HEAD',
  });
  const body = await res.text();
  // match for content="https://www.bilibili.com/video/???
  const match = /content="(https?:\/\/www\.bilibili\.com\/video\/.+?)"/.exec(
    body,
  );
  return match ? match[1] : res.url;
};

const regexFetch = ({ reExtracted }: NoxNetwork.RegexFetchProps) =>
  resolveB23TV(reExtracted[1]);

export default {
  regexSearchMatch: /b23.tv\/(.+)/,
  regexFetch,
};
