import bfetch from '@utils/BiliFetch';

const API = 'https://s.search.bilibili.com/main/suggest?term={kw}';

export default async (kw: string, limit = 5): Promise<string[]> => {
  const res = await bfetch(API.replace('{kw}', kw));
  const json = await res.json();
  return json.result.tag.map((v: any) => v.value).slice(0, limit);
};
