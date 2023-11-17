/* eslint-disable @typescript-eslint/no-explicit-any */
import bfetch from '@utils/BiliFetch';

// see https://github.com/lovegaoshi/biliNFT

const API =
  'https://api.bilibili.com/x/garb/v2/mall/suit/detail?from=&from_id=&item_id={act_id}';

interface props {
  act_id: string;
  resolver?: (json: any) => string;
}

const biliGarbFetch = async ({
  act_id,
  resolver = (json: any) => json,
}: props) => {
  const res = await bfetch(API.replace('{act_id}', act_id));
  const json = await res.json();
  return resolver(json.data);
};

const biliGarbHeadVideoFetch = async ({ act_id }: props) => {
  return biliGarbFetch({
    act_id,
    resolver: (json: any) =>
      json.suit_items.skin[0].properties.head_myself_mp4_bg,
  });
};

export { biliGarbHeadVideoFetch };
