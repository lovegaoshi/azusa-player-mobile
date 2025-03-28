import bfetch, { getJson } from '@utils/BiliFetch';

// https://api.bilibili.com/x/web-interface/card?mid=529249&photo=true
export default async (mid: string): Promise<any> => {
  const data = await getJson(
    bfetch(
      `https://api.bilibili.com/x/web-interface/card?mid=${mid}&photo=true`,
    ),
  );
  return data?.data;
};
