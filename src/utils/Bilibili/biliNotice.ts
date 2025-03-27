import bfetch, { getJson } from '@utils/BiliFetch';

export default async (mid: string): Promise<string> => {
  const data = await getJson(
    bfetch(`https://api.bilibili.com/x/space/notice?mid=${mid}`),
  );
  return data?.data ?? '';
};
