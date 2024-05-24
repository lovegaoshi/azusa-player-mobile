import { regexFetchProps } from './generic';
import { logger } from '../Logger';

const resolveB23TV = async (url: string) => {
  logger.debug(`[b23.tv] fetching ${url}`);
  const res = await fetch(`https://b23.tv/${url}`, { method: 'HEAD' });
  return res.url;
};

const regexFetch = ({ reExtracted }: regexFetchProps) =>
  resolveB23TV(reExtracted[1]!);

export default {
  regexSearchMatch: /b23.tv\/(.+)/,
  regexFetch,
};
